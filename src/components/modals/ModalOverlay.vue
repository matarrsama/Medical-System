<template>
  <Teleport to="body">
    <div
      v-if="ui.activeModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-lg"
      @click.self="ui.closeModal()"
    >
      <div class="absolute inset-0 bg-on-surface/40 backdrop-blur-sm transition-opacity"></div>
      <div class="relative w-full flex flex-col z-10 shadow-2xl transition-all pointer-events-auto bg-surface-container-lowest rounded-xl overflow-hidden" :class="wrapperClass">
        <component :is="currentModal" @close="ui.closeModal()" />
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, defineAsyncComponent } from 'vue'
import { useUIStore } from '@/stores/ui'

const ui = useUIStore()

const modals = {
  NewTicket: defineAsyncComponent(() => import('./NewTicketModal.vue')),

  AddDepartment: defineAsyncComponent(() => import('./AddDepartmentModal.vue')),
  AddInventory: defineAsyncComponent(() => import('./AddInventoryModal.vue')),
  NewRequest: defineAsyncComponent(() => import('./NewRequestModal.vue')),
  NewPurchaseOrder: defineAsyncComponent(() => import('./NewPurchaseOrderModal.vue')),
  UserDetail: defineAsyncComponent(() => import('./UserDetailModal.vue')),
  AuditDetail: defineAsyncComponent(() => import('./AuditDetailModal.vue')),
  RoleMatrix: defineAsyncComponent(() => import('./RoleMatrixModal.vue')),
  ProvisionUser: defineAsyncComponent(() => import('./ProvisionUserModal.vue')),
  EditUser: defineAsyncComponent(() => import('./EditUserModal.vue')),
  ResetPassword: defineAsyncComponent(() => import('./ResetPasswordModal.vue')),
  TicketDetail: defineAsyncComponent(() => import('./TicketDetailModal.vue')),
  InventoryDetail: defineAsyncComponent(() => import('./InventoryDetailModal.vue')),
  PurchaseOrderDetail: defineAsyncComponent(() => import('./PurchaseOrderDetailModal.vue')),
  RequestDetail: defineAsyncComponent(() => import('./RequestDetailModal.vue')),
  ScheduleMaintenance: defineAsyncComponent(() => import('./ScheduleMaintenanceModal.vue')),
  MaintenanceDetail: defineAsyncComponent(() => import('./MaintenanceDetailModal.vue')),
  NewEquipment: defineAsyncComponent(() => import('./NewEquipmentModal.vue')),
  EquipmentDetail: defineAsyncComponent(() => import('./EquipmentDetailModal.vue')),
  DepartmentDetail: defineAsyncComponent(() => import('./DepartmentDetailModal.vue')),
  AddReport: defineAsyncComponent(() => import('./AddReportModal.vue')),
  ReportDetail: defineAsyncComponent(() => import('./ReportDetailModal.vue')),
  ExportReports: defineAsyncComponent(() => import('./ExportReportsModal.vue')),
  DeleteConfirm: defineAsyncComponent(() => import('./DeleteConfirmModal.vue')),
  ChangePassword: defineAsyncComponent(() => import('./ChangePasswordModal.vue')),
  Help: defineAsyncComponent(() => import('./HelpModal.vue'))
}

const currentModal = computed(() => modals[ui.activeModal] || null)

const wrapperClass = computed(() => {
  if (ui.modalExpanded) return 'max-w-6xl w-[95vw] h-[95vh] max-h-[95vh]'
  if (ui.activeModal === 'ProvisionUser') return 'max-w-4xl h-[90vh] max-h-[90vh]'
  if (ui.activeModal === 'ResetPassword') return 'max-w-md'
  if (ui.activeModal === 'DeleteConfirm') return 'max-w-md'
  return 'max-w-3xl h-[90vh] max-h-[90vh]'
})
</script>
