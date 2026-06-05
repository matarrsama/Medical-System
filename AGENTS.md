# Session Log

## What was done
- **Dynamic role permissions system**: `auth.js` store loads roles from Firestore, `hasPermission(perm)` checks the current user's role's permission map; all `canManage*`/`canView*` computed properties delegate to it
- **Roles admin page**: `RolesView.vue` with role table + CRUD + "Seed Defaults" button; `RoleFormModal.vue` with permission checkboxes grouped by category
- **Route + sidebar** for `/admin/roles`
- **Replaced all hardcoded role arrays** in views (`DepartmentsView`, `UsersView`, `ProcurementView`, `RequestsView`, `MaintenanceView`, `BiomedicalView`, `InventoryView`) with `authStore.canManage*` / `authStore.hasPermission()` references
- **Replaced all hardcoded role arrays in modals** with auth store dynamic checks
- **`firestore.rules`**: added `hasRolePermission()` helper reading `config/rolePermissions` doc via `get()`; replaced hardcoded strings in `leaveRequests` rules; added `roles` and `config` collection rules
- **Provisioning `StepRoleAccess.vue`**: loads roles from Firestore via `onSnapshot`, uses `role.name` directly
- **`EditUserModal.vue`**: loads roles from Firestore, removed `labelToId`/`idToLabel` conversions
- **`UsersView.vue`**: role/department filter dropdowns now render dynamically from Firestore roles and `deptStore.items`
- **`ProvisionUserModal.vue`**: passes `wizardData.role` directly without conversion
- **Date comparison bug fixed**: `DepartmentsView`, `DepartmentDetailModal`, `LeaveDetailModal` changed from `new Date()` comparison to YYYY-MM-DD string comparison to avoid timezone mismatch in `activeApprovedLeaves`
- **Granular CRUD permission system**: expanded from 15 to 40+ granular permissions across 9 groups (Admin, Users, Departments, Tickets, Leaves, Inventory, Maintenance, Biomedical, Procurement, General). Each feature area has specific create/edit/delete/status permissions.
- **Temporarily added Roles Management section to Settings page** (visible to users with `canManageUsers` or Super Admin) so roles can be seeded and managed without the separate Roles page.
- **Seed defaults updated** to map old coarse permissions to new granular ones.
- **All views/modals updated** to use specific granular permissions instead of broad `canManage*` checks.
- **Build passes** with `npm run build`

## Granular Permissions List (40 total)
| Group | Permissions |
|---|---|
| Admin | `canAccessAdmin`, `canAccessAuditLogs`, `canManageRoles` |
| Users | `canCreateUsers`, `canEditUsers`, `canSuspendUsers`, `canDeleteUsers`, `canResetUserPasswords` |
| Departments | `canCreateDepartments`, `canEditDepartments`, `canDeleteDepartments` |
| Tickets | `canViewAllTickets`, `canCreateTickets`, `canEditTickets`, `canDeleteTickets`, `canUpdateTicketStatus` |
| Leaves | `canViewAllLeaves`, `canApproveLeaves`, `canRejectLeaves`, `canDeleteLeaves`, `canConfigureLeaves` |
| Inventory | `canCreateInventory`, `canEditInventory`, `canDeleteInventory`, `canChangeInventoryStatus` |
| Maintenance | `canCreateMaintenance`, `canEditMaintenance`, `canDeleteMaintenance`, `canUpdateMaintenanceStatus` |
| Biomedical | `canCreateEquipment`, `canEditEquipment`, `canDeleteEquipment` |
| Procurement | `canCreatePO`, `canEditPO`, `canDeletePO`, `canUpdatePOStatus` |
| General | `canChooseDepartment`, `canManageServiceRequests` |

## Backward-compatible broad computeds (OR of granular)
- `canManageUsers` = canCreateUsers \|\| canEditUsers \|\| canSuspendUsers \|\| canDeleteUsers \|\| canResetUserPasswords
- `canManageDepartments` = canCreateDepartments \|\| canEditDepartments \|\| canDeleteDepartments
- `canManageLeaves` = canApproveLeaves \|\| canRejectLeaves \|\| canDeleteLeaves \|\| canConfigureLeaves
- `canManageInventory` = canCreateInventory \|\| canEditInventory \|\| canDeleteInventory \|\| canChangeInventoryStatus
- `canScheduleMaintenance` = canCreateMaintenance \|\| canEditMaintenance \|\| canDeleteMaintenance \|\| canUpdateMaintenanceStatus
- `isBiomedicalAdmin` = canCreateEquipment \|\| canEditEquipment \|\| canDeleteEquipment
- `canManageProcurement` = canCreatePO \|\| canEditPO \|\| canDeletePO \|\| canUpdatePOStatus
- `canAddPurchaseOrder` = canCreatePO (alias)
- `canUpdatePurchaseOrderStatus` = canUpdatePOStatus (alias)

## Seed Defaults Mapping
- **Sys Admin**: ALL permissions
- **Hospital Admin / ICT Officer**: full CRUD across all areas + approve/reject/configure leaves (hospital admin only) + update PO status (hospital admin only)
- **Finance Head**: canCreatePO only
- All other roles: no permissions assigned (can be added manually via UI)

## Google Apps Script Email Setup

### 1. Create the Apps Script Web App
1. Go to https://script.google.com and create a new project
2. Paste this code:
```js
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  MailApp.sendEmail({
    to: data.to,
    subject: data.subject,
    htmlBody: data.body
  });
  return ContentService
    .createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```
3. Deploy → New Deployment → Web App
   - Execute as: **Me**
   - Access: **Anyone**
4. Copy the deployment URL

### 2. Set environment variable
In Netlify, set `GAS_URL` to your Apps Script web app URL:
```
netlify env:set GAS_URL https://script.google.com/macros/s/.../exec
```

### 3. Test
Provision a new staff member — they should receive a welcome email.

## File Structure — Email System
- `netlify/functions/_shared/email.js` — shared utility that calls GAS
- `netlify/functions/send-email.js` — Netlify function proxy (validates + forwards)
- `src/services/email.js` — frontend service with template helpers:
  - `sendWelcomeEmail()` — sent after staff provisioning
  - `sendPasswordResetEmail()` — sent when admin resets a password
  - `sendLeaveSubmittedNotification()` — sent when staff submits a leave request
  - `sendLeaveNotification()` — sent when leave is approved/rejected

## Current Email Triggers
| Event | Sender | Recipient |
|---|---|---|
| Staff provisioned | `ProvisionUserModal.vue` | New staff's email |
| Password reset | `ResetPasswordModal.vue` | Staff's email |
| Leave submitted | `NewLeaveRequestModal.vue` | Staff's email |
| Leave approved/rejected | `LeaveDetailModal.vue` | Leave creator's email |

## Remaining
1. **Deploy firestore.rules**: `firebase deploy --only firestore:rules` (manual)
2. **Seed default roles**: visit Settings page → Roles Management → click "Seed Defaults"
3. **Set GAS_URL env var** in Netlify
4. **Build & deploy**: `npm run build`
5. **Verify**: check departments page on-leave count (should reflect today-ending leaves correctly)
