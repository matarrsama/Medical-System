const FUNCTIONS_BASE = import.meta.env.VITE_NETLIFY_FUNCTIONS_URL || '/.netlify/functions'
const API_URL = `${FUNCTIONS_BASE}/send-email`

export async function sendEmail({ to, subject, body, type }) {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, body, type })
    })
    const text = await res.text()
    if (!text) return { success: false, error: 'Empty response' }
    try {
      return JSON.parse(text)
    } catch (parseErr) {
      console.debug('[email] Non-JSON response:', res.status, text.slice(0, 200))
      return { success: false, error: 'Email service unavailable (non-JSON response)' }
    }
  } catch (err) {
    if (err.message !== 'Empty response') console.debug('[email] Not available:', err.message)
    return { success: false, error: err.message }
  }
}

// ── Broadcast helpers ─────────────────────────────────────────

const ADMIN_ROLES = ['Sys Administrator', 'Hospital Admin', 'ICT Officer']

export async function getGroupRecipients({ department, extraEmails }) {
  const { collection, query, where, getDocs, getDoc, doc } = await import('firebase/firestore')
  const { db } = await import('@/lib/firebase')
  const recipients = []
  const seen = new Set()

  const adminSnap = await getDocs(query(collection(db, 'users'), where('role', 'in', ADMIN_ROLES)))
  adminSnap.forEach(d => {
    const u = d.data()
    if (u.email && !seen.has(u.email)) {
      seen.add(u.email)
      recipients.push({ email: u.email, name: u.name || u.email, role: u.role })
    }
  })

  if (department) {
    const deptSnap = await getDocs(query(collection(db, 'departments'), where('name', '==', department)))
    if (!deptSnap.empty) {
      const dept = deptSnap.docs[0].data()
      if (dept.headId) {
        const headSnap = await getDoc(doc(db, 'users', dept.headId))
        if (headSnap.exists()) {
          const h = headSnap.data()
          if (h.email && !seen.has(h.email)) {
            seen.add(h.email)
            recipients.push({ email: h.email, name: h.name || h.email, role: h.role })
          }
        }
      }
    }
  }

  if (extraEmails) {
    const valid = extraEmails.filter(Boolean)
    if (valid.length > 0) {
      const nameMap = {}
      try {
        const extraSnap = await getDocs(query(collection(db, 'users'), where('email', 'in', valid.slice(0, 10))))
        extraSnap.forEach(d => { nameMap[d.data().email] = d.data().name || d.data().email })
      } catch (_) {}
      for (const e of valid) {
        if (!seen.has(e)) {
          seen.add(e)
          recipients.push({ email: e, name: nameMap[e] || e, role: '' })
        }
      }
    }
  }

  return recipients
}

async function broadcastToGroup({ subject, bodyFn, department, extraEmails }) {
  const recipients = await getGroupRecipients({ department, extraEmails })
  return Promise.allSettled(recipients.map(r => sendEmail({ to: r.email, subject, body: bodyFn(r) })))
}

// ── Personal (single-recipient) emails ─────────────────────────

export async function sendWelcomeEmail(user) {
  return sendEmail({
    to: user.email,
    subject: 'Welcome to the Hospital Staff Portal',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a73e8; padding: 24px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 22px;">Welcome to the Staff Portal</h1>
        </div>
        <div style="padding: 24px; background: #f8f9fa;">
          <p style="font-size: 16px; color: #333;">Hi <strong>${user.name}</strong>,</p>
          <p style="font-size: 14px; color: #555;">Your account has been created. Here are your details:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Employee ID</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${user.employeeId}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Email</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${user.email}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Role</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${user.role}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Department</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${user.department}</td></tr>
          </table>
          <p style="font-size: 14px; color: #555;">Please contact the administrator if you have any questions.</p>
        </div>
        <div style="padding: 16px; text-align: center; font-size: 12px; color: #999;">
          &copy; ${new Date().getFullYear()} Hospital Management System
        </div>
      </div>
    `
  })
}

export async function sendPasswordResetEmail(user, tempPassword) {
  return sendEmail({
    to: user.email,
    subject: 'Your Password Has Been Reset',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #e65100; padding: 24px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 22px;">Password Reset</h1>
        </div>
        <div style="padding: 24px; background: #f8f9fa;">
          <p style="font-size: 16px; color: #333;">Hi <strong>${user.name}</strong>,</p>
          <p style="font-size: 14px; color: #555;">Your password has been reset by an administrator.</p>
          <div style="background: #fff3e0; border: 1px solid #ffe0b2; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0 0 8px; font-size: 13px; color: #555;">Your temporary password:</p>
            <p style="margin: 0; font-size: 20px; font-weight: bold; font-family: monospace; color: #e65100; letter-spacing: 2px;">${tempPassword}</p>
          </div>
          <p style="font-size: 14px; color: #555;">Please contact the administrator if you have any questions.</p>
        </div>
        <div style="padding: 16px; text-align: center; font-size: 12px; color: #999;">
          &copy; ${new Date().getFullYear()} Hospital Management System
        </div>
      </div>
    `
  })
}

export async function sendSuspensionNotification(user, status) {
  const isSuspended = status === 'Suspended'
  return sendEmail({
    to: user.email,
    subject: isSuspended ? 'Account Suspended' : 'Account Reactivated',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${isSuspended ? '#c62828' : '#2e7d32'}; padding: 24px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 22px;">${isSuspended ? 'Account Suspended' : 'Account Reactivated'}</h1>
        </div>
        <div style="padding: 24px; background: #f8f9fa;">
          <p style="font-size: 16px; color: #333;">Hi <strong>${user.name || user.email}</strong>,</p>
          <p style="font-size: 14px; color: #555;">Your account has been <strong>${isSuspended ? 'suspended' : 'reactivated'}</strong>.</p>
          ${isSuspended ? '<p style="font-size: 14px; color: #555;">You will not be able to log in until an administrator reactivates your account.</p>' : '<p style="font-size: 14px; color: #555;">You can now log in and access the system.</p>'}
          <p style="font-size: 14px; color: #555;">Please contact the administrator if you have any questions.</p>
        </div>
        <div style="padding: 16px; text-align: center; font-size: 12px; color: #999;">
          &copy; ${new Date().getFullYear()} Hospital Management System
        </div>
      </div>
    `
  })
}

// ── Leave emails ──────────────────────────────────────────────

export async function sendLeaveSubmittedNotification(leave, department, creatorEmail) {
  return broadcastToGroup({
    department,
    extraEmails: creatorEmail ? [creatorEmail] : [],
    subject: 'Leave Request Submitted',
    bodyFn: (r) => {
      const isCreator = r.email === creatorEmail
      return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1565c0; padding: 24px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 22px;">Leave Request Submitted</h1>
        </div>
        <div style="padding: 24px; background: #f8f9fa;">
          <p style="font-size: 16px; color: #333;">Hi <strong>${r.name}</strong>,</p>
          <p style="font-size: 14px; color: #555;">${isCreator ? 'Your leave request has been submitted and is pending approval.' : `A leave request has been submitted by <strong>${leave.createdByName || leave.createdBy || '—'}</strong> and is pending approval.`}</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Staff</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${leave.createdByName || leave.createdBy || '—'}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Type</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${leave.type}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">From</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${leave.startDate}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">To</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${leave.endDate}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Department</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${department || leave.department || '—'}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Status</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold; color: #f57c00;">PENDING</td></tr>
          </table>
        </div>
        <div style="padding: 16px; text-align: center; font-size: 12px; color: #999;">
          &copy; ${new Date().getFullYear()} Hospital Management System
        </div>
      </div>
    `}
  })
}

export async function sendLeaveNotification(leave, creatorUser, type, note, department) {
  const isApproval = type === 'approved'
  const title = isApproval ? 'Leave Request Approved' : 'Leave Request Rejected'
  const color = isApproval ? '#2e7d32' : '#c62828'
  const statusText = isApproval ? 'approved' : 'rejected'
  const adminNote = note || leave.adminNote || ''
  const creatorName = creatorUser?.name || creatorUser?.email || 'Staff'

  return broadcastToGroup({
    department,
    extraEmails: [creatorUser?.email],
    subject: title,
    bodyFn: (r) => {
      const isCreator = r.email === creatorUser?.email
      return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${color}; padding: 24px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 22px;">${title}</h1>
        </div>
        <div style="padding: 24px; background: #f8f9fa;">
          <p style="font-size: 16px; color: #333;">Hi <strong>${isCreator ? creatorName : r.name}</strong>,</p>
          <p style="font-size: 14px; color: #555;">${isCreator ? 'Your' : `<strong>${creatorName}'s</strong>`} leave request has been <strong>${statusText}</strong>.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Type</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${leave.type}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">From</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${leave.startDate}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">To</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${leave.endDate}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Status</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold; color: ${color};">${statusText.toUpperCase()}</td></tr>
          </table>
          ${adminNote ? `<div style="background: #fff3e0; border: 1px solid #ffe0b2; border-radius: 8px; padding: 16px; margin: 16px 0;"><p style="margin: 0 0 4px; font-size: 13px; color: #e65100; font-weight: bold;">Admin Note</p><p style="margin: 0; font-size: 14px; color: #555;">${adminNote}</p></div>` : ''}
        </div>
        <div style="padding: 16px; text-align: center; font-size: 12px; color: #999;">
          &copy; ${new Date().getFullYear()} Hospital Management System
        </div>
      </div>
    `}
  })
}

// ── Ticket emails ─────────────────────────────────────────────

export async function sendTicketCreatedNotification(ticket, department, assigneeEmail) {
  return broadcastToGroup({
    department,
    extraEmails: assigneeEmail ? [assigneeEmail] : [],
    subject: `Ticket ${ticket.ticketId} Created`,
    bodyFn: (r) => {
      const isAssignee = r.email === assigneeEmail
      return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1565c0; padding: 24px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 22px;">New Ticket Created</h1>
        </div>
        <div style="padding: 24px; background: #f8f9fa;">
          <p style="font-size: 16px; color: #333;">Hi <strong>${r.name}</strong>,</p>
          <p style="font-size: 14px; color: #555;">A new ticket has been created.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Ticket</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${ticket.ticketId}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Title</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${ticket.title}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Priority</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${ticket.priority}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Category</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${ticket.category}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Department</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${department || '—'}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Assigned To</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${ticket.assignee || 'Unassigned'}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Status</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${ticket.status || 'Open'}</td></tr>
          </table>
          ${isAssignee ? '<p style="font-size: 14px; color: #555;">You have been assigned to this ticket.</p>' : ''}
        </div>
        <div style="padding: 16px; text-align: center; font-size: 12px; color: #999;">
          &copy; ${new Date().getFullYear()} Hospital Management System
        </div>
      </div>
    `}
  })
}

export async function sendTicketStatusNotification(ticket, department, status) {
  return broadcastToGroup({
    department,
    subject: `Ticket ${ticket.ticketId} Status: ${status}`,
    bodyFn: (r) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #e65100; padding: 24px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 22px;">Ticket Status Updated</h1>
        </div>
        <div style="padding: 24px; background: #f8f9fa;">
          <p style="font-size: 16px; color: #333;">Hi <strong>${r.name}</strong>,</p>
          <p style="font-size: 14px; color: #555;">A ticket status has been updated.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Ticket</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${ticket.ticketId}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Title</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${ticket.title}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Department</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${department || '—'}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">New Status</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${status}</td></tr>
          </table>
        </div>
        <div style="padding: 16px; text-align: center; font-size: 12px; color: #999;">
          &copy; ${new Date().getFullYear()} Hospital Management System
        </div>
      </div>
    `
  })
}

// ── Service Request emails ────────────────────────────────────

export async function sendRequestCreatedNotification(request, department) {
  return broadcastToGroup({
    department,
    subject: `Service Request ${request.requestId} Submitted`,
    bodyFn: (r) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1565c0; padding: 24px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 22px;">Service Request Submitted</h1>
        </div>
        <div style="padding: 24px; background: #f8f9fa;">
          <p style="font-size: 16px; color: #333;">Hi <strong>${r.name}</strong>,</p>
          <p style="font-size: 14px; color: #555;">A new service request has been submitted.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Request</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${request.requestId}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Title</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${request.title}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Type</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${request.type}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Priority</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${request.priority}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Department</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${department || request.department || '—'}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Status</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold; color: #f57c00;">PENDING</td></tr>
          </table>
        </div>
        <div style="padding: 16px; text-align: center; font-size: 12px; color: #999;">
          &copy; ${new Date().getFullYear()} Hospital Management System
        </div>
      </div>
    `
  })
}

export async function sendRequestStatusNotification(request, department, status) {
  const color = status === 'Approved' ? '#2e7d32' : status === 'Rejected' ? '#c62828' : '#e65100'
  return broadcastToGroup({
    department,
    subject: `Request ${request.requestId} ${status}`,
    bodyFn: (r) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${color}; padding: 24px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 22px;">Request ${status}</h1>
        </div>
        <div style="padding: 24px; background: #f8f9fa;">
          <p style="font-size: 16px; color: #333;">Hi <strong>${r.name}</strong>,</p>
          <p style="font-size: 14px; color: #555;">A service request status has been updated to <strong>${status}</strong>.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Request</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${request.requestId}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Title</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${request.title}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Department</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${department || request.department || '—'}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">New Status</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold; color: ${color};">${status}</td></tr>
          </table>
        </div>
        <div style="padding: 16px; text-align: center; font-size: 12px; color: #999;">
          &copy; ${new Date().getFullYear()} Hospital Management System
        </div>
      </div>
    `
  })
}

// ── Inventory emails ──────────────────────────────────────────

export async function sendInventoryAddedNotification(asset, department) {
  return broadcastToGroup({
    department,
    subject: `Asset ${asset.assetTag} Added to Inventory`,
    bodyFn: (r) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2e7d32; padding: 24px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 22px;">New Asset Added</h1>
        </div>
        <div style="padding: 24px; background: #f8f9fa;">
          <p style="font-size: 16px; color: #333;">Hi <strong>${r.name}</strong>,</p>
          <p style="font-size: 14px; color: #555;">A new asset has been added to inventory.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Asset Tag</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${asset.assetTag}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Name</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${asset.name}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Category</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${asset.category}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Department</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${department || asset.department || '—'}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Status</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${asset.status || 'Active'}</td></tr>
          </table>
        </div>
        <div style="padding: 16px; text-align: center; font-size: 12px; color: #999;">
          &copy; ${new Date().getFullYear()} Hospital Management System
        </div>
      </div>
    `
  })
}

export async function sendInventoryStatusNotification(asset, department, status) {
  return broadcastToGroup({
    department,
    subject: `Asset ${asset.assetTag} Status: ${status}`,
    bodyFn: (r) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #e65100; padding: 24px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 22px;">Asset Status Updated</h1>
        </div>
        <div style="padding: 24px; background: #f8f9fa;">
          <p style="font-size: 16px; color: #333;">Hi <strong>${r.name}</strong>,</p>
          <p style="font-size: 14px; color: #555;">An asset status has been updated.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Asset Tag</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${asset.assetTag}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Name</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${asset.name}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Department</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${department || asset.department || '—'}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">New Status</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${status}</td></tr>
          </table>
        </div>
        <div style="padding: 16px; text-align: center; font-size: 12px; color: #999;">
          &copy; ${new Date().getFullYear()} Hospital Management System
        </div>
      </div>
    `
  })
}

// ── Equipment emails ──────────────────────────────────────────

export async function sendEquipmentCreatedNotification(equipment, department) {
  return broadcastToGroup({
    department,
    subject: `Equipment ${equipment.equipmentId} Added`,
    bodyFn: (r) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1565c0; padding: 24px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 22px;">New Equipment Added</h1>
        </div>
        <div style="padding: 24px; background: #f8f9fa;">
          <p style="font-size: 16px; color: #333;">Hi <strong>${r.name}</strong>,</p>
          <p style="font-size: 14px; color: #555;">New equipment has been added.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Equipment ID</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${equipment.equipmentId}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Name</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${equipment.name}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Type</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${equipment.type}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Department</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${department || equipment.department || '—'}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Status</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${equipment.status}</td></tr>
          </table>
        </div>
        <div style="padding: 16px; text-align: center; font-size: 12px; color: #999;">
          &copy; ${new Date().getFullYear()} Hospital Management System
        </div>
      </div>
    `
  })
}

export async function sendEquipmentUpdatedNotification(equipment, department) {
  return broadcastToGroup({
    department,
    subject: `Equipment ${equipment.equipmentId} Updated`,
    bodyFn: (r) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #e65100; padding: 24px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 22px;">Equipment Updated</h1>
        </div>
        <div style="padding: 24px; background: #f8f9fa;">
          <p style="font-size: 16px; color: #333;">Hi <strong>${r.name}</strong>,</p>
          <p style="font-size: 14px; color: #555;">Equipment details have been updated.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Equipment ID</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${equipment.equipmentId}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Name</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${equipment.name}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Type</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${equipment.type}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Department</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${department || equipment.department || '—'}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Status</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${equipment.status}</td></tr>
          </table>
        </div>
        <div style="padding: 16px; text-align: center; font-size: 12px; color: #999;">
          &copy; ${new Date().getFullYear()} Hospital Management System
        </div>
      </div>
    `
  })
}

// ── Maintenance emails ────────────────────────────────────────

export async function sendMaintenanceScheduledNotification(task, department) {
  return broadcastToGroup({
    department,
    subject: `Maintenance ${task.maintenanceId} Scheduled`,
    bodyFn: (r) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #6a1b9a; padding: 24px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 22px;">Maintenance Scheduled</h1>
        </div>
        <div style="padding: 24px; background: #f8f9fa;">
          <p style="font-size: 16px; color: #333;">Hi <strong>${r.name}</strong>,</p>
          <p style="font-size: 14px; color: #555;">A new maintenance task has been scheduled.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Maintenance ID</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${task.maintenanceId}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Equipment</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${task.equipment}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Type</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${task.type}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Department</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${department || task.department || '—'}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Scheduled</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${task.scheduledDate || '—'}</td></tr>
          </table>
        </div>
        <div style="padding: 16px; text-align: center; font-size: 12px; color: #999;">
          &copy; ${new Date().getFullYear()} Hospital Management System
        </div>
      </div>
    `
  })
}

export async function sendMaintenanceStatusNotification(task, department, status) {
  return broadcastToGroup({
    department,
    subject: `Maintenance ${task.maintenanceId} Status: ${status}`,
    bodyFn: (r) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #e65100; padding: 24px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 22px;">Maintenance Status Updated</h1>
        </div>
        <div style="padding: 24px; background: #f8f9fa;">
          <p style="font-size: 16px; color: #333;">Hi <strong>${r.name}</strong>,</p>
          <p style="font-size: 14px; color: #555;">A maintenance task status has been updated.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Maintenance ID</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${task.maintenanceId}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Equipment</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${task.equipment}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Department</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${department || task.department || '—'}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">New Status</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${status}</td></tr>
          </table>
        </div>
        <div style="padding: 16px; text-align: center; font-size: 12px; color: #999;">
          &copy; ${new Date().getFullYear()} Hospital Management System
        </div>
      </div>
    `
  })
}

// ── Purchase Order emails ─────────────────────────────────────

export async function sendPOCreatedNotification(po, department) {
  return broadcastToGroup({
    department,
    subject: `Purchase Order ${po.poNumber} Created`,
    bodyFn: (r) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1565c0; padding: 24px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 22px;">Purchase Order Created</h1>
        </div>
        <div style="padding: 24px; background: #f8f9fa;">
          <p style="font-size: 16px; color: #333;">Hi <strong>${r.name}</strong>,</p>
          <p style="font-size: 14px; color: #555;">A new purchase order has been created.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">PO Number</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${po.poNumber}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Vendor</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${po.vendor}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Amount</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">$${Number(po.amount).toLocaleString()}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Department</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${department || po.department || '—'}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Status</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold; color: #f57c00;">PENDING</td></tr>
          </table>
        </div>
        <div style="padding: 16px; text-align: center; font-size: 12px; color: #999;">
          &copy; ${new Date().getFullYear()} Hospital Management System
        </div>
      </div>
    `
  })
}

export async function sendPOStatusNotification(po, department, status) {
  return broadcastToGroup({
    department,
    subject: `PO ${po.poNumber} Status: ${status}`,
    bodyFn: (r) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #e65100; padding: 24px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 22px;">PO Status Updated</h1>
        </div>
        <div style="padding: 24px; background: #f8f9fa;">
          <p style="font-size: 16px; color: #333;">Hi <strong>${r.name}</strong>,</p>
          <p style="font-size: 14px; color: #555;">A purchase order status has been updated.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">PO Number</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${po.poNumber}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Vendor</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${po.vendor}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Department</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${department || po.department || '—'}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">New Status</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${status}</td></tr>
          </table>
        </div>
        <div style="padding: 16px; text-align: center; font-size: 12px; color: #999;">
          &copy; ${new Date().getFullYear()} Hospital Management System
        </div>
      </div>
    `
  })
}

// ── Admin notification emails ─────────────────────────────────

export async function sendDeleteNotification(resource, resourceType, deletedBy, adminUsers) {
  const label = { po: 'PO', ticket: 'Ticket', request: 'Request', asset: 'Asset', maintenance: 'Maintenance', equipment: 'Equipment', department: 'Department', user: 'User' }[resourceType] || 'Item'
  return Promise.allSettled(
    adminUsers.map(u => sendEmail({
      to: u.email,
      subject: `${label} Deleted: ${resource}`,
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #c62828; padding: 24px; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 22px;">${label} Deleted</h1>
          </div>
          <div style="padding: 24px; background: #f8f9fa;">
            <p style="font-size: 16px; color: #333;">Hi <strong>${u.name}</strong>,</p>
            <p style="font-size: 14px; color: #555;">A ${label.toLowerCase()} has been deleted from the system.</p>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">${label}</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${resource}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Deleted By</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${deletedBy}</td></tr>
            </table>
          </div>
          <div style="padding: 16px; text-align: center; font-size: 12px; color: #999;">
            &copy; ${new Date().getFullYear()} Hospital Management System
          </div>
        </div>
      `
    }))
  )
}

export async function sendDepartmentNotification(dept, action, adminUsers) {
  const title = action === 'created' ? 'Department Created' : 'Department Updated'
  const color = action === 'created' ? '#1565c0' : '#e65100'
  return Promise.allSettled(
    adminUsers.map(u => sendEmail({
      to: u.email,
      subject: `${title}: ${dept.name}`,
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: ${color}; padding: 24px; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 22px;">${title}</h1>
          </div>
          <div style="padding: 24px; background: #f8f9fa;">
            <p style="font-size: 16px; color: #333;">Hi <strong>${u.name}</strong>,</p>
            <p style="font-size: 14px; color: #555;">A department has been ${action}.</p>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Department</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${dept.name}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Head</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${dept.headName || dept.head || '—'}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Location</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${dept.location || '—'}</td></tr>
            </table>
          </div>
          <div style="padding: 16px; text-align: center; font-size: 12px; color: #999;">
            &copy; ${new Date().getFullYear()} Hospital Management System
          </div>
        </div>
      `
    }))
  )
}

// ── Legacy alias (notifyAdmins still available) ───────────────

export async function notifyAdmins(subject, body, adminRoles = ADMIN_ROLES) {
  const { collection, query, where, getDocs } = await import('firebase/firestore')
  const { db } = await import('@/lib/firebase')
  try {
    const q = query(collection(db, 'users'), where('role', 'in', adminRoles))
    const snap = await getDocs(q)
    await Promise.allSettled(
      snap.docs.map(d => {
        const u = d.data()
        return u.email ? sendEmail({ to: u.email, subject, body }) : Promise.resolve()
      })
    )
  } catch (err) {
    console.debug('[email] notifyAdmins error:', err.message)
  }
}
