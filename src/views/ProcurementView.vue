<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-lg">
      <div>
        <h2 class="text-display font-display text-on-surface">Procurement &amp; Vendor Management</h2>
        <p class="text-body-md font-body-md text-on-surface-variant mt-1">Manage purchase orders, vendor contracts, and requisitions.</p>
      </div>
      <button @click="ui.openModal('NewPurchaseOrder')" class="bg-primary text-on-primary text-label-md font-label-md px-4 py-2 rounded-lg hover:bg-primary-container transition-colors shadow-sm flex items-center gap-2">
        <span class="material-symbols-outlined text-[18px]">add</span>
        New Purchase Order
      </button>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
      <div class="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        <div class="p-4 border-b border-outline-variant">
          <h3 class="text-headline-sm font-headline-md text-on-surface">Purchase Orders</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-surface-container-low text-on-surface-variant text-label-sm font-label-sm uppercase tracking-wider">
                <th class="p-3 pl-4 border-b border-outline-variant font-medium">PO Number</th>
                <th class="p-3 border-b border-outline-variant font-medium">Vendor</th>
                <th class="p-3 border-b border-outline-variant font-medium hidden md:table-cell">Amount</th>
                <th class="p-3 border-b border-outline-variant font-medium">Status</th>
              </tr>
            </thead>
            <tbody class="text-body-sm text-on-surface">
              <tr v-for="po in purchaseOrders" :key="po.id" class="hover:bg-surface-container-lowest cursor-pointer border-b border-outline-variant/30 last:border-0">
                <td class="p-3 pl-4 text-primary font-medium">{{ po.id }}</td>
                <td class="p-3">{{ po.vendor }}</td>
                <td class="p-3 hidden md:table-cell">${{ po.amount.toLocaleString() }}</td>
                <td class="p-3">
                  <span :class="poStatusClass(po.status)" class="px-2 py-0.5 rounded text-label-sm font-label-sm">{{ po.status }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-lg">
        <h3 class="text-headline-sm font-headline-md text-on-surface mb-4">Top Vendors</h3>
        <div class="space-y-3">
          <div v-for="vendor in vendors" :key="vendor.name" class="flex items-center justify-between p-3 bg-surface-container rounded-lg">
            <div>
              <div class="text-body-md font-medium text-on-surface">{{ vendor.name }}</div>
              <div class="text-label-sm text-on-surface-variant">{{ vendor.contracts }} contracts</div>
            </div>
            <span class="text-label-sm font-label-sm text-primary">{{ vendor.status }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useUIStore } from '@/stores/ui'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query } from 'firebase/firestore'

const ui = useUIStore()
const purchaseOrders = ref([])
const vendors = ref([])
let unsubscribePO = null
let unsubscribeVendors = null

onMounted(() => {
  const qPO = query(collection(db, 'purchaseOrders'))
  unsubscribePO = onSnapshot(qPO, (snapshot) => {
    purchaseOrders.value = snapshot.docs.map(doc => ({ ...doc.data() }))
  })
  const qVendors = query(collection(db, 'vendors'))
  unsubscribeVendors = onSnapshot(qVendors, (snapshot) => {
    vendors.value = snapshot.docs.map(doc => {
      const { slug, ...rest } = doc.data()
      return rest
    })
  })
})

onUnmounted(() => {
  if (unsubscribePO) unsubscribePO()
  if (unsubscribeVendors) unsubscribeVendors()
})

function poStatusClass(s) {
  const map = { Pending: 'bg-amber-100 text-amber-800', Approved: 'bg-blue-100 text-blue-800', Delivered: 'bg-green-100 text-green-800' }
  return map[s] || ''
}
</script>
