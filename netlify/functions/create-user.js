import { db, auth } from './_shared/admin.js'

export const handler = async (event) => {
  try {
    const data = JSON.parse(event.body)
    const { email, password, displayName, employeeId, title, department, role, mfa, avatar } = data

    const userRecord = await auth.createUser({ email, password, displayName })
    const uid = userRecord.uid

    await auth.setCustomUserClaims(uid, { role })

    await db.collection('users').doc(uid).set({
      uid,
      name: displayName,
      initials: displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2),
      email,
      employeeId,
      title,
      department,
      role,
      mfa: mfa || 'push',
      status: 'Active',
      avatar: avatar || '',
      created: new Date().toISOString().split('T')[0],
      lastActive: 'Just now'
    })

    return { statusCode: 200, body: JSON.stringify({ uid }) }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}
