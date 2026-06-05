export const PERMISSIONS = [
  { id: 'canAccessAdmin', label: 'Access Admin Settings', group: 'Admin' },
  { id: 'canAccessAuditLogs', label: 'View Audit Logs', group: 'Admin' },
  { id: 'canManageRoles', label: 'Manage Roles', group: 'Admin' },
  { id: 'canCreateUsers', label: 'Create Users', group: 'Users' },
  { id: 'canEditUsers', label: 'Edit Users', group: 'Users' },
  { id: 'canSuspendUsers', label: 'Suspend Users', group: 'Users' },
  { id: 'canDeleteUsers', label: 'Delete Users', group: 'Users' },
  { id: 'canResetUserPasswords', label: 'Reset User Passwords', group: 'Users' },
  { id: 'canCreateDepartments', label: 'Create Departments', group: 'Departments' },
  { id: 'canEditDepartments', label: 'Edit Departments', group: 'Departments' },
  { id: 'canDeleteDepartments', label: 'Delete Departments', group: 'Departments' },
  { id: 'canViewAllTickets', label: 'View All Tickets', group: 'Tickets' },
  { id: 'canCreateTickets', label: 'Create Tickets', group: 'Tickets' },
  { id: 'canEditTickets', label: 'Edit Any Ticket', group: 'Tickets' },
  { id: 'canDeleteTickets', label: 'Delete Tickets', group: 'Tickets' },
  { id: 'canUpdateTicketStatus', label: 'Update Ticket Status', group: 'Tickets' },
  { id: 'canViewAllLeaves', label: 'View All Leave Requests', group: 'Leave Requests' },
  { id: 'canApproveLeaves', label: 'Approve Leave Requests', group: 'Leave Requests' },
  { id: 'canRejectLeaves', label: 'Reject Leave Requests', group: 'Leave Requests' },
  { id: 'canDeleteLeaves', label: 'Delete Leave Requests', group: 'Leave Requests' },
  { id: 'canConfigureLeaves', label: 'Configure Leave Settings', group: 'Leave Requests' },
  { id: 'canCreateInventory', label: 'Create Inventory Items', group: 'Inventory' },
  { id: 'canEditInventory', label: 'Edit Inventory Items', group: 'Inventory' },
  { id: 'canDeleteInventory', label: 'Delete Inventory Items', group: 'Inventory' },
  { id: 'canChangeInventoryStatus', label: 'Change Inventory Status', group: 'Inventory' },
  { id: 'canCreateMaintenance', label: 'Create Maintenance Tasks', group: 'Maintenance' },
  { id: 'canEditMaintenance', label: 'Edit Maintenance Tasks', group: 'Maintenance' },
  { id: 'canDeleteMaintenance', label: 'Delete Maintenance Tasks', group: 'Maintenance' },
  { id: 'canUpdateMaintenanceStatus', label: 'Update Maintenance Status', group: 'Maintenance' },
  { id: 'canCreateEquipment', label: 'Create Equipment Records', group: 'Biomedical' },
  { id: 'canEditEquipment', label: 'Edit Equipment Records', group: 'Biomedical' },
  { id: 'canDeleteEquipment', label: 'Delete Equipment Records', group: 'Biomedical' },
  { id: 'canCreatePO', label: 'Create Purchase Orders', group: 'Procurement' },
  { id: 'canEditPO', label: 'Edit Purchase Orders', group: 'Procurement' },
  { id: 'canDeletePO', label: 'Delete Purchase Orders', group: 'Procurement' },
  { id: 'canUpdatePOStatus', label: 'Update Purchase Order Status', group: 'Procurement' },
  { id: 'canChooseDepartment', label: 'Choose Department in Forms', group: 'General' },
  { id: 'canManageServiceRequests', label: 'Manage Service Requests', group: 'General' }
]

export const ROLES = [
  { id: 'sys_admin', label: 'Sys Administrator' },
  { id: 'ict_officer', label: 'ICT Officer' },
  { id: 'physician', label: 'Physician' },
  { id: 'nurse', label: 'Nurse' },
  { id: 'doctor', label: 'Doctor' },
  { id: 'hospital_admin', label: 'Hospital Admin' },
  { id: 'lab_technician', label: 'Lab Technician' },
  { id: 'pharmacist', label: 'Pharmacist' },
  { id: 'accounting', label: 'Accounting' },
  { id: 'finance', label: 'Finance' },
  { id: 'procurement', label: 'Procurement' },
  { id: 'viewer', label: 'Viewer' }
]

export function labelToId(label) {
  const found = ROLES.find(r => r.label === label)
  return found ? found.id : label
}

export function idToLabel(id) {
  const found = ROLES.find(r => r.id === id)
  return found ? found.label : id
}
