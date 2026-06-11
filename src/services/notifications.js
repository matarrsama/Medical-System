import { getGroupRecipients } from './email'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

async function createNotifications(recipients, { icon, iconBg, iconColor, title, message, messageFn, resourceType, resourceId }) {
  if (!recipients || recipients.length === 0) return
  const col = collection(db, 'notifications')
  const writes = recipients.map(r =>
    addDoc(col, {
      email: r.email,
      name: r.name,
      read: false,
      timestamp: serverTimestamp(),
      icon, iconBg, iconColor, title,
      message: messageFn ? messageFn(r) : message,
      resourceType: resourceType || null,
      resourceId: resourceId || null,
    })
  )
  await Promise.allSettled(writes)
}

async function notifyPersonal({ email, name, icon, iconBg, iconColor, title, message, resourceType, resourceId }) {
  if (!email) return
  await addDoc(collection(db, 'notifications'), {
    email,
    name: name || email,
    read: false,
    timestamp: serverTimestamp(),
    icon, iconBg, iconColor, title, message,
    resourceType: resourceType || null,
    resourceId: resourceId || null,
  })
}

// ── Leave notifications ──────────────────────────────

export async function notifyLeaveSubmitted(leave, department, creatorEmail) {
  const recipients = await getGroupRecipients({ department, extraEmails: creatorEmail ? [creatorEmail] : [] })
  await createNotifications(recipients, {
    icon: 'event_note',
    iconBg: 'bg-primary-container dark:bg-primary-container/40',
    iconColor: 'text-primary dark:text-inverse-primary',
    title: 'Leave Request Submitted',
    messageFn: r => r.email === creatorEmail
      ? 'Your leave request has been submitted and is pending approval.'
      : `A leave request has been submitted by ${leave.createdByName || leave.createdBy || 'Staff'}.`,
    resourceType: 'leave',
    resourceId: leave.leaveId || leave.id,
  })
}

export async function notifyLeaveProcessed(leave, creatorUser, type, note, department) {
  const recipients = await getGroupRecipients({ department, extraEmails: [creatorUser?.email] })
  const isApproval = type === 'approved'
  await createNotifications(recipients, {
    icon: isApproval ? 'check_circle' : 'cancel',
    iconBg: isApproval ? 'bg-tertiary-container dark:bg-tertiary-container/40' : 'bg-error-container dark:bg-error-container/40',
    iconColor: isApproval ? 'text-tertiary dark:text-inverse-tertiary' : 'text-error dark:text-on-error-container',
    title: isApproval ? 'Leave Request Approved' : 'Leave Request Rejected',
    messageFn: r => {
      const isCreator = r.email === creatorUser?.email
      const base = isCreator
        ? `Your leave request has been ${type}.`
        : `${creatorUser?.name || creatorUser?.email || 'Staff'}'s leave request has been ${type}.`
      return note ? `${base} Note: ${note}` : base
    },
    resourceType: 'leave',
    resourceId: leave.leaveId || leave.id,
  })
}

// ── Ticket notifications ─────────────────────────────

export async function notifyTicketCreated(ticket, department, assigneeEmail) {
  const recipients = await getGroupRecipients({ department, extraEmails: assigneeEmail ? [assigneeEmail] : [] })
  await createNotifications(recipients, {
    icon: 'assignment',
    iconBg: 'bg-primary-container dark:bg-primary-container/40',
    iconColor: 'text-primary dark:text-inverse-primary',
    title: `Ticket ${ticket.ticketId} Created`,
    messageFn: r => r.email === assigneeEmail
      ? `Ticket ${ticket.ticketId}: ${ticket.title} — You have been assigned.`
      : `Ticket ${ticket.ticketId}: ${ticket.title}`,
    resourceType: 'ticket',
    resourceId: ticket.ticketId,
  })
}

export async function notifyTicketStatus(ticket, department, status) {
  const recipients = await getGroupRecipients({ department })
  await createNotifications(recipients, {
    icon: 'update',
    iconBg: 'bg-secondary-container dark:bg-secondary-container/40',
    iconColor: 'text-secondary dark:text-inverse-secondary',
    title: `Ticket ${ticket.ticketId} Status: ${status}`,
    message: `Ticket ${ticket.ticketId} (${ticket.title}) status updated to ${status}.`,
    resourceType: 'ticket',
    resourceId: ticket.ticketId,
  })
}

// ── Service Request notifications ─────────────────────

export async function notifyRequestCreated(request, department) {
  const recipients = await getGroupRecipients({ department })
  await createNotifications(recipients, {
    icon: 'description',
    iconBg: 'bg-primary-container dark:bg-primary-container/40',
    iconColor: 'text-primary dark:text-inverse-primary',
    title: `Request ${request.requestId} Submitted`,
    message: `Request ${request.requestId}: ${request.title}`,
    resourceType: 'request',
    resourceId: request.requestId,
  })
}

export async function notifyRequestStatus(request, department, status) {
  const recipients = await getGroupRecipients({ department })
  await createNotifications(recipients, {
    icon: 'fact_check',
    iconBg: 'bg-secondary-container dark:bg-secondary-container/40',
    iconColor: 'text-secondary dark:text-inverse-secondary',
    title: `Request ${request.requestId} ${status}`,
    message: `Request ${request.requestId} (${request.title}) has been ${status.toLowerCase()}.`,
    resourceType: 'request',
    resourceId: request.requestId,
  })
}

// ── Inventory notifications ──────────────────────────

export async function notifyInventoryAdded(asset, department) {
  const recipients = await getGroupRecipients({ department })
  await createNotifications(recipients, {
    icon: 'inventory_2',
    iconBg: 'bg-tertiary-container dark:bg-tertiary-container/40',
    iconColor: 'text-tertiary dark:text-inverse-tertiary',
    title: `Asset ${asset.assetTag} Added`,
    message: `Asset ${asset.assetTag}: ${asset.name} added to inventory.`,
    resourceType: 'asset',
    resourceId: asset.assetTag,
  })
}

export async function notifyInventoryStatus(asset, department, status) {
  const recipients = await getGroupRecipients({ department })
  await createNotifications(recipients, {
    icon: 'shelf_auto',
    iconBg: 'bg-secondary-container dark:bg-secondary-container/40',
    iconColor: 'text-secondary dark:text-inverse-secondary',
    title: `Asset ${asset.assetTag} Status: ${status}`,
    message: `Asset ${asset.assetTag} (${asset.name}) status changed to ${status}.`,
    resourceType: 'asset',
    resourceId: asset.assetTag,
  })
}

// ── Equipment notifications ──────────────────────────

export async function notifyEquipmentCreated(equipment, department) {
  const recipients = await getGroupRecipients({ department })
  await createNotifications(recipients, {
    icon: 'precision_manufacturing',
    iconBg: 'bg-primary-container dark:bg-primary-container/40',
    iconColor: 'text-primary dark:text-inverse-primary',
    title: `Equipment ${equipment.equipmentId} Added`,
    message: `Equipment ${equipment.equipmentId}: ${equipment.name} added.`,
    resourceType: 'equipment',
    resourceId: equipment.equipmentId,
  })
}

export async function notifyEquipmentUpdated(equipment, department) {
  const recipients = await getGroupRecipients({ department })
  await createNotifications(recipients, {
    icon: 'build',
    iconBg: 'bg-secondary-container dark:bg-secondary-container/40',
    iconColor: 'text-secondary dark:text-inverse-secondary',
    title: `Equipment ${equipment.equipmentId} Updated`,
    message: `Equipment ${equipment.equipmentId} (${equipment.name}) details updated.`,
    resourceType: 'equipment',
    resourceId: equipment.equipmentId,
  })
}

// ── Maintenance notifications ────────────────────────

export async function notifyMaintenanceScheduled(task, department) {
  const recipients = await getGroupRecipients({ department })
  await createNotifications(recipients, {
    icon: 'build_circle',
    iconBg: 'bg-tertiary-container dark:bg-tertiary-container/40',
    iconColor: 'text-tertiary dark:text-inverse-tertiary',
    title: `Maintenance ${task.maintenanceId} Scheduled`,
    message: `Maintenance ${task.maintenanceId} scheduled for ${task.equipment || 'equipment'}.`,
    resourceType: 'maintenance',
    resourceId: task.maintenanceId,
  })
}

export async function notifyMaintenanceStatus(task, department, status) {
  const recipients = await getGroupRecipients({ department })
  await createNotifications(recipients, {
    icon: 'engineering',
    iconBg: 'bg-secondary-container dark:bg-secondary-container/40',
    iconColor: 'text-secondary dark:text-inverse-secondary',
    title: `Maintenance ${task.maintenanceId} Status: ${status}`,
    message: `Maintenance ${task.maintenanceId} (${task.equipment || ''}) status: ${status}.`,
    resourceType: 'maintenance',
    resourceId: task.maintenanceId,
  })
}

// ── Purchase Order notifications ─────────────────────

export async function notifyPOCreated(po, department) {
  const recipients = await getGroupRecipients({ department })
  await createNotifications(recipients, {
    icon: 'receipt_long',
    iconBg: 'bg-primary-container dark:bg-primary-container/40',
    iconColor: 'text-primary dark:text-inverse-primary',
    title: `PO ${po.poNumber} Created`,
    message: `Purchase Order ${po.poNumber} created for ${po.vendor}.`,
    resourceType: 'po',
    resourceId: po.poNumber,
  })
}

export async function notifyPOStatus(po, department, status) {
  const recipients = await getGroupRecipients({ department })
  await createNotifications(recipients, {
    icon: 'paid',
    iconBg: 'bg-secondary-container dark:bg-secondary-container/40',
    iconColor: 'text-secondary dark:text-inverse-secondary',
    title: `PO ${po.poNumber} Status: ${status}`,
    message: `Purchase Order ${po.poNumber} (${po.vendor}) status: ${status}.`,
    resourceType: 'po',
    resourceId: po.poNumber,
  })
}

// ── Admin notification emails ────────────────────────

export async function notifyDeleted(resource, resourceType, deletedBy, adminUsers) {
  const label = { po: 'PO', ticket: 'Ticket', request: 'Request', asset: 'Asset', maintenance: 'Maintenance', equipment: 'Equipment', department: 'Department', user: 'User' }[resourceType] || 'Item'
  if (!adminUsers?.length) return
  const col = collection(db, 'notifications')
  const writes = adminUsers.map(u =>
    addDoc(col, {
      email: u.email,
      name: u.name || u.email,
      read: false,
      timestamp: serverTimestamp(),
      icon: 'delete',
      iconBg: 'bg-error-container dark:bg-error-container/40',
      iconColor: 'text-error dark:text-on-error-container',
      title: `${label} Deleted: ${resource}`,
      message: `${label} "${resource}" was deleted by ${deletedBy}.`,
      resourceType,
      resourceId: resource,
    })
  )
  await Promise.allSettled(writes)
}

export async function notifyDepartment(dept, action, adminUsers) {
  if (!adminUsers?.length) return
  const col = collection(db, 'notifications')
  const writes = adminUsers.map(u =>
    addDoc(col, {
      email: u.email,
      name: u.name || u.email,
      read: false,
      timestamp: serverTimestamp(),
      icon: 'business',
      iconBg: action === 'created' ? 'bg-primary-container dark:bg-primary-container/40' : 'bg-secondary-container dark:bg-secondary-container/40',
      iconColor: action === 'created' ? 'text-primary dark:text-inverse-primary' : 'text-secondary dark:text-inverse-secondary',
      title: action === 'created' ? 'Department Created' : 'Department Updated',
      message: `Department "${dept.name}" has been ${action}.`,
      resourceType: 'department',
      resourceId: dept.name,
    })
  )
  await Promise.allSettled(writes)
}

// ── Personal notifications (single recipient) ────────

export async function notifyWelcome(user) {
  await notifyPersonal({
    email: user.email,
    name: user.name,
    icon: 'person_add',
    iconBg: 'bg-primary-container dark:bg-primary-container/40',
    iconColor: 'text-primary dark:text-inverse-primary',
    title: 'Welcome to the Staff Portal',
    message: `Your account has been created. Employee ID: ${user.employeeId}`,
    resourceType: 'user',
    resourceId: user.employeeId || null,
  })
}

export async function notifyPasswordReset(user, tempPassword) {
  await notifyPersonal({
    email: user.email,
    name: user.name,
    icon: 'lock_reset',
    iconBg: 'bg-secondary-container dark:bg-secondary-container/40',
    iconColor: 'text-secondary dark:text-inverse-secondary',
    title: 'Password Reset',
    message: `Your password has been reset by an administrator.`,
    resourceType: 'user',
    resourceId: user.employeeId || null,
  })
}

export async function notifySuspension(user, status) {
  const isSuspended = status === 'Suspended'
  await notifyPersonal({
    email: user.email,
    name: user.name,
    icon: isSuspended ? 'block' : 'check_circle',
    iconBg: isSuspended ? 'bg-error-container dark:bg-error-container/40' : 'bg-tertiary-container dark:bg-tertiary-container/40',
    iconColor: isSuspended ? 'text-error dark:text-on-error-container' : 'text-tertiary dark:text-inverse-tertiary',
    title: isSuspended ? 'Account Suspended' : 'Account Reactivated',
    message: isSuspended ? 'Your account has been suspended.' : 'Your account has been reactivated.',
    resourceType: 'user',
    resourceId: user.employeeId || null,
  })
}
