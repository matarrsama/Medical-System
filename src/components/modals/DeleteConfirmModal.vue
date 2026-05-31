<template>
  <div class="flex flex-col">
    <div class="flex items-center gap-4 px-6 pt-6 pb-2">
      <div class="w-12 h-12 rounded-full bg-error-container/30 flex items-center justify-center shrink-0">
        <span class="material-symbols-outlined text-error text-[24px] icon-fill">delete_forever</span>
      </div>
      <div>
        <h3 class="text-headline-sm font-headline-md text-on-surface">{{ isBatch ? `Delete ${label(true)}` : `Delete ${label(false)}` }}</h3>
        <p class="text-body-sm text-on-surface-variant mt-0.5">This action cannot be undone.</p>
      </div>
    </div>

    <div class="px-6 py-4">
      <template v-if="isBatch">
        <div class="p-4 rounded-xl bg-surface-container-low border border-outline-variant/50 space-y-2">
          <p class="text-body-sm text-on-surface-variant">You are about to delete {{ items.length }} {{ label(true) }}:</p>
          <div v-for="t in items" :key="t.id" class="flex items-center gap-2">
            <span class="font-mono text-label-sm font-label-sm text-primary bg-primary-container/30 px-2 py-0.5 rounded shrink-0">{{ displayId(t) }}</span>
            <span class="text-body-sm text-on-surface truncate">{{ t.title }}</span>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="p-4 rounded-xl bg-surface-container-low border border-outline-variant/50">
          <div class="flex items-center gap-3">
            <span class="font-mono text-label-sm font-label-sm text-primary bg-primary-container/30 px-2 py-0.5 rounded">{{ displayId(item) }}</span>
            <span class="text-body-sm font-body-sm text-on-surface font-medium truncate">{{ item?.title }}</span>
          </div>
        </div>
      </template>
    </div>

    <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-outline-variant bg-surface-container-low">
      <button @click="$emit('close')" class="px-5 py-2.5 rounded-lg text-label-md font-label-md text-on-surface hover:bg-surface-container-higher transition-colors">
        Cancel
      </button>
      <button @click="confirmDelete" :disabled="deleting" class="flex items-center gap-2 px-6 py-2.5 rounded-lg text-label-md font-label-md text-on-error bg-error transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
        <span v-if="deleting" class="material-symbols-outlined animate-spin text-[18px]">sync</span>
        <span v-else class="material-symbols-outlined text-[18px]">delete</span>
        {{ isBatch ? `Delete ${items.length} ${label(true)}` : `Delete ${label(false)}` }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUIStore } from '@/stores/ui'
import { useToast } from '@/composables/useToast'
import { useAuditLog } from '@/composables/useAuditLog'
import { db, auth } from '@/lib/firebase'
import { doc, deleteDoc } from 'firebase/firestore'
import { deleteUser } from '@/services/api'

const ui = useUIStore()
const toast = useToast()
const { logActivity } = useAuditLog()
const emit = defineEmits(['close'])
const raw = computed(() => ui.modalData)
const isBatch = computed(() => Array.isArray(raw.value))
const items = computed(() => isBatch.value ? raw.value : [raw.value])
const item = computed(() => isBatch.value ? raw.value[0] : (raw.value || {}))
const deleting = ref(false)

function typeOf(t) {
  if (!t) return 'unknown'
  if ('ticketId' in t) return 'ticket'
  if ('requestId' in t) return 'request'
  if ('poNumber' in t) return 'po'
  if ('assetTag' in t) return 'asset'
  if ('maintenanceId' in t) return 'maintenance'
  if ('equipmentId' in t) return 'equipment'
  if ('reportId' in t && !('assetTag' in t)) return 'report'
  if ('deptId' in t || ('name' in t && !('ticketId' in t) && !('requestId' in t) && !('poNumber' in t) && !('assetTag' in t) && !('maintenanceId' in t) && !('equipmentId' in t) && !('reportId' in t) && !('action' in t) && !('uid' in t))) return 'department'
  if ('action' in t && 'resource' in t) return 'auditLog'
  if ('uid' in t && 'email' in t) return 'user'
  return 'unknown'
}

function collectionName() {
  const map = { ticket: 'tickets', request: 'requests', po: 'purchaseOrders', asset: 'inventory', maintenance: 'maintenanceTasks', equipment: 'equipment', department: 'departments', report: 'reports', auditLog: 'auditLogs' }
  return map[typeOf(items.value[0])] || 'tickets'
}

function displayId(t) {
  return t?.ticketId || t?.requestId || t?.poNumber || t?.assetTag || t?.maintenanceId || t?.equipmentId || t?.reportId || t?.deptId || t?.id || t?.name || t?.resource
}

function label(plural) {
  const map = { ticket: plural ? 'Tickets' : 'Ticket', request: plural ? 'Requests' : 'Request', po: plural ? 'POs' : 'PO', asset: plural ? 'Assets' : 'Asset', maintenance: plural ? 'Tasks' : 'Task', equipment: plural ? 'Equipment' : 'Equipment', department: plural ? 'Departments' : 'Department', report: plural ? 'Reports' : 'Report', auditLog: plural ? 'Audit Logs' : 'Audit Log' }
  return map[typeOf(items.value[0])] || (plural ? 'Items' : 'Item')
}

const resourceLabels = { po: 'PO', ticket: 'Ticket', request: 'Request', asset: 'Asset', maintenance: 'Maintenance', equipment: 'Equipment', department: 'Department', report: 'Report', auditLog: 'Audit Log', user: 'User' }

async function confirmDelete() {
  deleting.value = true
  const col = collectionName()
  const list = items.value
  let success = 0
  let lastErr = null
  for (const t of list) {
    try {
      if (typeOf(t) === 'user') {
        await deleteUser(t.uid)
      } else {
        await deleteDoc(doc(db, col, t.id))
      }
      success++
      if (typeOf(t) === 'auditLog') continue
      const resourceId = displayId(t)
      await logActivity({ action: 'Delete', resource: `${resourceLabels[typeOf(t)] || 'Item'} ${resourceId}`, details: `Deleted by ${auth.currentUser?.displayName || auth.currentUser?.email || 'System'}` })
    } catch (err) {
      console.error(`[DeleteConfirmModal] error deleting from ${col}:`, err)
      lastErr = err
    }
  }
  if (success > 0) toast.success(`${success} ${label(true)} deleted.`)
  if (lastErr && success === 0) toast.error(lastErr.code === 'permission-denied' ? `You do not have permission to delete ${label(true).toLowerCase()}.` : `Failed to delete ${label(true).toLowerCase()}.`)
  deleting.value = false
  emit('close')
}
</script>
