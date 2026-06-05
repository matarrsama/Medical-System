<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center justify-between px-6 py-4 border-b border-outline-variant dark:border-outline shrink-0">
      <div class="flex items-center gap-3">
        <span class="material-symbols-outlined text-primary text-[22px]">shopping_cart</span>
        <div>
          <h3 class="text-headline-md font-headline-md text-on-surface dark:text-inverse-on-surface">{{ editing ? 'Edit PO' : 'Purchase Order Details' }}</h3>
          <p class="text-body-sm text-on-surface-variant dark:text-outline mt-0.5">{{ order.poNumber || order.id }}</p>
        </div>
      </div>
      <button @click="$emit('close')" class="p-1.5 rounded-lg hover:bg-surface-container dark:hover:bg-white/[0.08] text-on-surface-variant dark:text-outline transition-colors">
        <span class="material-symbols-outlined text-[20px]">close</span>
      </button>
    </div>

    <div class="flex-1 overflow-y-auto px-6 py-5 space-y-6">
      <div v-if="!editing && authStore.canUpdatePurchaseOrderStatus" class="flex items-center gap-2 mb-2">
        <span class="text-label-sm text-outline font-medium mr-1">Status:</span>
        <button v-for="s in ['Pending', 'Approved', 'Delivered']" :key="s" @click="updateStatus(s)" :class="[s === order.status ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container hover:bg-surface-container-higher text-on-surface-variant dark:text-outline', 'px-3 py-1.5 rounded-lg text-label-sm font-label-sm transition-all']">{{ s }}</button>
      </div>
      <div class="flex items-start gap-4">
        <div class="min-w-0 flex-1">
          <template v-if="editing">
            <input v-model="editForm.vendor" class="w-full px-3 py-2.5 border border-outline-variant dark:border-outline rounded-lg text-headline-sm font-headline-md bg-surface dark:bg-inverse-surface focus:ring-1 focus:ring-primary" />
          </template>
          <template v-else>
            <h2 class="text-headline-sm font-headline-md text-on-surface dark:text-inverse-on-surface">{{ order.vendor }}</h2>
          </template>
          <div class="flex items-center gap-3 mt-2">
            <span :class="statusClass(editing ? editForm.status : order.status)" class="px-2.5 py-0.5 rounded text-label-sm font-label-sm">{{ editing ? editForm.status : order.status }}</span>
            <span class="text-label-sm text-on-surface-variant dark:text-outline">{{ formatCurrency(editing ? editForm.amount : order.amount) }}</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-x-6 gap-y-4 p-4 rounded-xl bg-surface-container-low dark:bg-inverse-surface">
        <div>
          <span class="text-label-sm text-outline font-medium">PO Number</span>
          <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5 font-mono">{{ order.poNumber || order.id }}</p>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Status</span>
          <template v-if="editing && authStore.canUpdatePurchaseOrderStatus">
            <select v-model="editForm.status" class="w-full mt-0.5 px-3 py-2 border border-outline-variant dark:border-outline rounded-lg text-body-sm bg-surface dark:bg-inverse-surface focus:ring-1 focus:ring-primary">
              <option>Pending</option><option>Approved</option><option>Delivered</option>
            </select>
          </template>
          <template v-else>
            <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ order.status || '—' }}</p>
          </template>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Vendor</span>
          <template v-if="editing">
            <input v-model="editForm.vendor" class="w-full mt-0.5 px-3 py-2 border border-outline-variant dark:border-outline rounded-lg text-body-sm bg-surface dark:bg-inverse-surface focus:ring-1 focus:ring-primary" />
          </template>
          <template v-else>
            <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ order.vendor || '—' }}</p>
          </template>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Vendor Phone</span>
          <template v-if="editing">
            <input v-model="editForm.vendorPhone" type="tel" class="w-full mt-0.5 px-3 py-2 border border-outline-variant dark:border-outline rounded-lg text-body-sm bg-surface dark:bg-inverse-surface focus:ring-1 focus:ring-primary" />
          </template>
          <template v-else>
            <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ order.vendorPhone || '—' }}</p>
          </template>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Vendor Email</span>
          <template v-if="editing">
            <input v-model="editForm.vendorEmail" type="email" class="w-full mt-0.5 px-3 py-2 border border-outline-variant dark:border-outline rounded-lg text-body-sm bg-surface dark:bg-inverse-surface focus:ring-1 focus:ring-primary" />
          </template>
          <template v-else>
            <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ order.vendorEmail || '—' }}</p>
          </template>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Amount</span>
          <template v-if="editing">
            <input v-model="editForm.amount" type="number" class="w-full mt-0.5 px-3 py-2 border border-outline-variant dark:border-outline rounded-lg text-body-sm bg-surface dark:bg-inverse-surface focus:ring-1 focus:ring-primary" />
          </template>
          <template v-else>
            <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ formatCurrency(order.amount) }}</p>
          </template>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Department</span>
          <template v-if="editing">
            <select v-model="editForm.department" class="w-full mt-0.5 px-3 py-2 border border-outline-variant dark:border-outline rounded-lg text-body-sm bg-surface dark:bg-inverse-surface focus:ring-1 focus:ring-primary">
              <option v-for="dept in deptStore.items" :key="dept.id" :value="dept.name">{{ dept.name }}</option>
            </select>
          </template>
          <template v-else>
            <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ order.department || '—' }}</p>
          </template>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Created by</span>
          <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ order.createdByName || order.createdBy || '—' }}</p>
        </div>
        <div>
          <span class="text-label-sm text-outline font-medium">Created</span>
          <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-medium mt-0.5">{{ formatDate(order.created) }}</p>
        </div>
      </div>

      <div>
        <h4 class="text-label-md font-label-md text-on-surface-variant dark:text-outline mb-2">Description</h4>
        <template v-if="editing">
          <textarea v-model="editForm.description" rows="4" class="w-full px-3 py-2.5 border border-outline-variant dark:border-outline rounded-lg text-body-sm bg-surface dark:bg-inverse-surface focus:ring-1 focus:ring-primary resize-none"></textarea>
        </template>
        <template v-else>
          <p class="text-body-md text-on-surface dark:text-inverse-on-surface bg-surface-container-low rounded-xl p-4 whitespace-pre-wrap">{{ order.description || 'No description provided.' }}</p>
        </template>
      </div>
    </div>

    <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-outline-variant dark:border-outline shrink-0 bg-surface-container-low dark:bg-inverse-surface">
      <template v-if="editing">
        <button @click="cancelEdit" class="px-5 py-2.5 rounded-lg text-label-md font-label-md text-on-surface dark:text-inverse-on-surface hover:bg-surface-container-higher transition-colors">
          Cancel
        </button>
        <button @click="save" :disabled="saving" class="flex items-center gap-2 px-6 py-2.5 rounded-lg text-label-md font-label-md text-on-primary bg-primary hover:bg-primary-container transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
          <span v-if="saving" class="material-symbols-outlined animate-spin text-[18px]">sync</span>
          <span v-else class="material-symbols-outlined text-[18px]">save</span>
          Save Changes
        </button>
      </template>
      <template v-else>
        <button v-if="authStore.canDeletePO" @click="deletePO" class="flex items-center gap-2 px-5 py-2.5 rounded-lg text-label-md font-label-md text-error hover:bg-error-container/20 transition-colors">
          <span class="material-symbols-outlined text-[18px]">delete</span>
          Delete
        </button>
        <button @click="$emit('close')" class="px-5 py-2.5 rounded-lg text-label-md font-label-md text-on-surface dark:text-inverse-on-surface hover:bg-surface-container-higher transition-colors">
          Close
        </button>
        <button v-if="authStore.canEditPO" @click="startEdit" class="flex items-center gap-2 px-6 py-2.5 rounded-lg text-label-md font-label-md text-on-primary bg-primary hover:bg-primary-container transition-all shadow-sm">
          <span class="material-symbols-outlined text-[18px]">edit</span>
          Edit PO
        </button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useUIStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { mapFirebaseError } from '@/utils/mapFirebaseError'
import { useDepartmentsStore } from '@/stores/departments'
import { useAuditLog } from '@/composables/useAuditLog'
import { useSettings } from '@/composables/useSettings'
import { db, auth } from '@/lib/firebase'
import { doc, updateDoc, onSnapshot } from 'firebase/firestore'

const ui = useUIStore()
const authStore = useAuthStore()
const toast = useToast()
const { logActivity } = useAuditLog()
const { formatCurrency } = useSettings()
const modalData = computed(() => ui.modalData || {})
const orderData = ref(modalData.value.order || modalData.value)
const order = computed(() => orderData.value)
const editing = ref(modalData.value.startEdit === true)
const saving = ref(false)
const deptStore = useDepartmentsStore()
let unsubOrder = null

const editForm = reactive({
  vendor: '', vendorPhone: '', vendorEmail: '', amount: 0, status: '', department: '', description: ''
})

function startEdit() {
  Object.assign(editForm, {
    vendor: order.value.vendor || '',
    vendorPhone: order.value.vendorPhone || '',
    vendorEmail: order.value.vendorEmail || '',
    amount: order.value.amount || 0,
    status: order.value.status || 'Pending',
    department: order.value.department || '',
    description: order.value.description || ''
  })
  editing.value = true
}

function cancelEdit() {
  editing.value = false
}

async function save() {
  if (!editForm.vendor.trim()) return
  saving.value = true
  try {
    await updateDoc(doc(db, 'purchaseOrders', order.value.id), {
      vendor: editForm.vendor,
      vendorPhone: editForm.vendorPhone,
      vendorEmail: editForm.vendorEmail,
      amount: Number(editForm.amount),
      status: editForm.status,
      department: editForm.department,
      description: editForm.description
    })
    await logActivity({ action: 'Update', resource: `PO ${order.value.poNumber || order.value.id}`, details: `Updated: ${editForm.vendor} - ${formatCurrency(editForm.amount)} (${editForm.status})` })
    await logActivity({ action: 'Update', resource: `PO ${order.value.poNumber || order.value.id}`, details: `Updated: ${editForm.vendor} - ${formatCurrency(editForm.amount)} (${editForm.status})` })
    toast.success(`PO ${order.value.poNumber || order.value.id} updated successfully!`)
    editing.value = false
  } catch (err) {
    console.error('[PurchaseOrderDetailModal] error updating PO:', err)
    toast.error(mapFirebaseError(err, 'Failed to update purchase order.'))
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  const orderId = orderData.value?.id
  if (orderId) {
    unsubOrder = onSnapshot(doc(db, 'purchaseOrders', orderId), (snap) => {
      if (snap.exists()) {
        orderData.value = { id: snap.id, poNumber: snap.data().poNumber || snap.id, ...snap.data() }
      }
    })
  }
  if (modalData.value.startEdit === true) startEdit()
})

onUnmounted(() => {
  if (unsubOrder) unsubOrder()
})

function deletePO() {
  ui.closeModal()
  ui.openModal('DeleteConfirm', orderData.value)
}

async function updateStatus(status) {
  saving.value = true
  try {
    await updateDoc(doc(db, 'purchaseOrders', order.value.id), { status })
    await logActivity({ action: 'Update', resource: `PO ${order.value.poNumber || order.value.id}`, details: `Status changed to ${status}` })
    toast.success(`PO status updated to ${status}!`)
  } catch (err) {
    console.error('[PurchaseOrderDetailModal] error updating status:', err)
    toast.error('Failed to update PO status.')
  } finally {
    saving.value = false
  }
}

function formatDate(v) {
  if (!v) return ''
  if (v?.toDate) return v.toDate().toLocaleString()
  return String(v)
}

function statusClass(s) {
  const map = { Pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200', Approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200', Delivered: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200' }
  return map[s] || ''
}
</script>
