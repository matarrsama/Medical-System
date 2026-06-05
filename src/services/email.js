const API_URL = '/.netlify/functions/send-email'

export async function sendEmail({ to, subject, body, type }) {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, body, type })
    })
    return await res.json()
  } catch (err) {
    console.error('[email] Failed to send:', err)
    return { success: false, error: err.message }
  }
}

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
          <p style="font-size: 14px; color: #555;">Please log in and change your password on first login.</p>
          <a href="${window.location.origin}/#/login" style="display: inline-block; padding: 12px 24px; background: #1a73e8; color: #fff; text-decoration: none; border-radius: 6px; margin-top: 8px;">Log In</a>
        </div>
        <div style="padding: 16px; text-align: center; font-size: 12px; color: #999;">
          &copy; 2025 Hospital Management System
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
          <p style="font-size: 14px; color: #555;">You will be required to change this on your next login.</p>
          <a href="${window.location.origin}/#/login" style="display: inline-block; padding: 12px 24px; background: #e65100; color: #fff; text-decoration: none; border-radius: 6px; margin-top: 8px;">Log In</a>
        </div>
        <div style="padding: 16px; text-align: center; font-size: 12px; color: #999;">
          &copy; 2025 Hospital Management System
        </div>
      </div>
    `
  })
}

export async function sendLeaveNotification(leave, user, type) {
  const isApproval = type === 'approved'
  const title = isApproval ? 'Leave Request Approved' : 'Leave Request Rejected'
  const color = isApproval ? '#2e7d32' : '#c62828'
  const statusText = isApproval ? 'approved' : 'rejected'

  return sendEmail({
    to: user.email,
    subject: title,
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${color}; padding: 24px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 22px;">${title}</h1>
        </div>
        <div style="padding: 24px; background: #f8f9fa;">
          <p style="font-size: 16px; color: #333;">Hi <strong>${user.name}</strong>,</p>
          <p style="font-size: 14px; color: #555;">Your leave request has been <strong>${statusText}</strong>.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Type</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${leave.type}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">From</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${leave.startDate}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">To</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${leave.endDate}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Status</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold; color: ${color};">${statusText.toUpperCase()}</td></tr>
          </table>
          ${leave.adminNote ? `<p style="font-size: 13px; color: #777; font-style: italic;">Note: ${leave.adminNote}</p>` : ''}
        </div>
        <div style="padding: 16px; text-align: center; font-size: 12px; color: #999;">
          &copy; 2025 Hospital Management System
        </div>
      </div>
    `
  })
}

export async function sendLeaveSubmittedNotification(leave, user) {
  return sendEmail({
    to: user.email,
    subject: 'Leave Request Submitted',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1565c0; padding: 24px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 22px;">Leave Request Submitted</h1>
        </div>
        <div style="padding: 24px; background: #f8f9fa;">
          <p style="font-size: 16px; color: #333;">Hi <strong>${user.name}</strong>,</p>
          <p style="font-size: 14px; color: #555;">Your leave request has been submitted and is pending approval.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Type</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${leave.type}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">From</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${leave.startDate}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">To</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${leave.endDate}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Status</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold; color: #f57c00;">PENDING</td></tr>
          </table>
        </div>
        <div style="padding: 16px; text-align: center; font-size: 12px; color: #999;">
          &copy; 2025 Hospital Management System
        </div>
      </div>
    `
  })
}
