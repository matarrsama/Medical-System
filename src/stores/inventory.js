import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useInventoryStore = defineStore('inventory', () => {
  const assets = ref([
    { tag: 'AST-001', name: 'Dell Optiplex 7090', category: 'Desktop', department: 'ER', status: 'Active', purchaseDate: '2024-03-15' },
    { tag: 'AST-002', name: 'Cisco Catalyst 9300', category: 'Network', department: 'Infrastructure', status: 'Active', purchaseDate: '2024-01-20' },
    { tag: 'AST-003', name: 'HP LaserJet M404', category: 'Printer', department: 'Admin', status: 'Maintenance', purchaseDate: '2023-11-10' }
  ])

  return { assets }
})
