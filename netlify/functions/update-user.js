import { db, auth, corsHeaders } from './_shared/admin.js'

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' }
  }
  try {
    const data = JSON.parse(event.body)
    const { uid, email, displayName, employeeId, title, department, role, mfa, status, avatar } = data

    await auth.updateUser(uid, { email, displayName })
    await auth.setCustomUserClaims(uid, { role })

    const update = {
      name: displayName,
      initials: displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2),
      email,
      employeeId,
      title,
      department,
      role,
      mfa,
      status,
      avatar: avatar || ''
    }

    await db.collection('users').doc(uid).update(update)

    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ uid }) }
  } catch (err) {
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: err.message }) }
  }
}
