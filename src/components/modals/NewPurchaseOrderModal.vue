<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center justify-between px-6 py-4 border-b border-outline-variant dark:border-outline shrink-0">
      <div class="flex items-center gap-3">
        <span class="material-symbols-outlined text-primary text-[22px]">shopping_cart</span>
        <div>
          <h3 class="text-headline-md font-headline-md text-on-surface dark:text-inverse-on-surface">New Purchase Order</h3>
          <p class="text-body-sm text-on-surface-variant dark:text-outline mt-0.5">Create a new purchase order for ICT procurement</p>
        </div>
      </div>
      <button @click="$emit('close')" class="p-1.5 rounded-lg hover:bg-surface-container dark:hover:bg-white/[0.08] text-on-surface-variant dark:text-outline transition-colors">
        <span class="material-symbols-outlined text-[20px]">close</span>
      </button>
    </div>

    <form @submit.prevent="submit" class="flex-1 overflow-y-auto px-6 py-5 space-y-5">
      <div class="flex items-center gap-3 p-4 rounded-xl bg-surface-container-low dark:bg-inverse-surface border border-outline-variant/50 dark:border-outline">
        <span class="material-symbols-outlined text-primary text-[20px]">tag</span>
        <div>
          <span class="text-label-sm text-outline font-medium">PO Number</span>
          <p class="text-body-md text-on-surface dark:text-inverse-on-surface font-mono font-medium mt-0.5">{{ poNumber || 'Generating…' }}</p>
        </div>
      </div>

      <div>
        <label class="text-label-md font-label-md text-on-surface dark:text-inverse-on-surface">Vendor <span class="text-error">*</span></label>
          <input v-model="form.vendor" class="w-full mt-1 px-3 py-2.5 border border-outline-variant dark:border-outline rounded-lg text-body-sm bg-surface dark:bg-inverse-surface focus:ring-1 focus:ring-primary" required />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-label-md font-label-md text-on-surface dark:text-inverse-on-surface">Vendor Phone</label>
          <input v-model="form.vendorPhone" type="tel" class="w-full mt-1 px-3 py-2.5 border border-outline-variant dark:border-outline rounded-lg text-body-sm bg-surface dark:bg-inverse-surface focus:ring-1 focus:ring-primary" />
        </div>
        <div>
          <label class="text-label-md font-label-md text-on-surface dark:text-inverse-on-surface">Vendor Email</label>
          <input v-model="form.vendorEmail" type="email" class="w-full mt-1 px-3 py-2.5 border border-outline-variant dark:border-outline rounded-lg text-body-sm bg-surface dark:bg-inverse-surface focus:ring-1 focus:ring-primary" />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-label-md font-label-md text-on-surface dark:text-inverse-on-surface">Amount ({{ currencySymbol() }}) <span class="text-error">*</span></label>
          <input v-model="form.amount" type="number" class="w-full mt-1 px-3 py-2.5 border border-outline-variant dark:border-outline rounded-lg text-body-sm bg-surface dark:bg-inverse-surface focus:ring-1 focus:ring-primary" required />
        </div>
        <div>
          <label class="text-label-md font-label-md text-on-surface dark:text-inverse-on-surface">Department <span class="text-error">*</span></label>
          <select v-if="canChooseDepartment" v-model="form.department" class="w-full mt-1 px-3 py-2.5 border border-outline-variant dark:border-outline rounded-lg text-body-sm bg-surface dark:bg-inverse-surface focus:ring-1 focus:ring-primary" required>
            <option v-for="dept in deptStore.items" :key="dept.id" :value="dept.name">{{ dept.name }}</option>
          </select>
          <div v-else class="flex items-center gap-2 mt-1 px-3 py-2.5 border border-outline-variant/50 dark:border-outline rounded-lg bg-surface-container text-body-sm text-on-surface dark:text-inverse-on-surface font-medium">
            <span class="material-symbols-outlined text-[16px] text-outline">business</span>
            {{ userDept }}
          </div>
        </div>
      </div>

      <div>
        <label class="text-label-md font-label-md text-on-surface dark:text-inverse-on-surface">Description</label>
        <textarea v-model="form.description" rows="3" class="w-full mt-1 px-3 py-2.5 border border-outline-variant dark:border-outline rounded-lg text-body-sm bg-surface dark:bg-inverse-surface focus:ring-1 focus:ring-primary resize-none"></textarea>
      </div>
    </form>

    <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-outline-variant dark:border-outline shrink-0 bg-surface-container-low dark:bg-inverse-surface">
      <button type="button" @click="$emit('close')" class="px-5 py-2.5 rounded-lg text-label-md font-label-md text-on-surface dark:text-inverse-on-surface hover:bg-surface-container-higher transition-colors">
        Cancel
      </button>
      <button @click="submit" :disabled="saving" class="flex items-center gap-2 px-6 py-2.5 rounded-lg text-label-md font-label-md text-on-primary bg-primary hover:bg-primary-container transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
        <span v-if="saving" class="material-symbols-outlined animate-spin text-[18px]">sync</span>
        <span v-else class="material-symbols-outlined text-[18px]">add</span>
        Create PO
      </button>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, onUnmounted } from 'vue'
import { useToast } from '@/composables/useToast'
import { mapFirebaseError } from '@/utils/mapFirebaseError'
import { generateId } from '@/utils/generateId'
import { useAuthStore } from '@/stores/auth'
import { useDepartmentsStore } from '@/stores/departments'
import { useSettings } from '@/composables/useSettings'
import { useAuditLog } from '@/composables/useAuditLog'
import { db, auth } from '@/lib/firebase'
import { addDoc, collection, serverTimestamp, getDoc, doc } from 'firebase/firestore'
import { sendPOCreatedNotification } from '@/services/email'
import { notifyPOCreated } from '@/services/notifications'

const emit = defineEmits(['close'])
const toast = useToast()
const authStore = useAuthStore()
const deptStore = useDepartmentsStore()
const { logActivity } = useAuditLog()
const { formatCurrency, currencySymbol } = useSettings()
const canChooseDepartment = computed(() => authStore.canChooseDepartment)

const form = reactive({ vendor: '', vendorPhone: '', vendorEmail: '', amount: 0, department: '', description: '' })
const poNumber = ref('')
const saving = ref(false)
const userDept = ref('')

async function submit() {
  if (!form.vendor.trim()) return
  saving.value = true
  try {
    await addDoc(collection(db, 'purchaseOrders'), {
      poNumber: poNumber.value,
      vendor: form.vendor,
      vendorPhone: form.vendorPhone,
      vendorEmail: form.vendorEmail,
      amount: Number(form.amount),
      department: form.department || userDept.value,
      description: form.description,
      status: 'Pending',
      createdBy: auth.currentUser?.uid || null,
      createdByName: auth.currentUser?.displayName || null,
      created: serverTimestamp()
    })
    await logActivity({ action: 'Create', resource: `PO ${poNumber.value}`, details: `Vendor: ${form.vendor} - ${formatCurrency(form.amount)}` })
    toast.success(`PO ${poNumber.value} created successfully!`)
    sendPOCreatedNotification({ poNumber: poNumber.value, vendor: form.vendor, amount: form.amount }, form.department)
    notifyPOCreated({ poNumber: poNumber.value, vendor: form.vendor, amount: form.amount }, form.department)
    emit('close')
  } catch (err) {
    console.error('[NewPurchaseOrderModal] error creating PO:', err)
    toast.error(mapFirebaseError(err, 'Failed to create purchase order.'))
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  const year = new Date().getFullYear()
  poNumber.value = generateId(`PO-${year}-`, 6)
  const uid = auth.currentUser?.uid
  if (uid) {
    const userSnap = await getDoc(doc(db, 'users', uid))
    if (userSnap.exists()) {
      userDept.value = userSnap.data().department || ''
      form.department = userDept.value
    }
  }
})

onUnmounted(() => {})
</script>
