import { db, auth, corsHeaders } from './_shared/admin.js'

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' }
  }
  try {
    const data = JSON.parse(event.body)
    const { email, password, displayName, employeeId, title, department, role, mfa, avatar, makeDepartmentHead } = data

    const userRecord = await auth.createUser({ email, password, displayName })
    const uid = userRecord.uid

    const claims = { role }
    if (makeDepartmentHead && department) {
      claims.deptHeadOf = department
    }
    await auth.setCustomUserClaims(uid, claims)

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
      lastActive: new Date().toISOString(),
      mustChangePassword: true
    })

    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ uid }) }
  } catch (err) {
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: err.message }) }
  }
}
