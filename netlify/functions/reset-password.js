import { auth, db, corsHeaders } from './_shared/admin.js'

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' }
  }
  try {
    const { uid } = JSON.parse(event.body)

    const tempPassword = Array.from({ length: 8 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 62)]).join('')
    await auth.updateUser(uid, { password: tempPassword })

    await db.collection('users').doc(uid).update({ mustChangePassword: true })

    const userRecord = await auth.getUser(uid)

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ tempPassword, email: userRecord.email })
    }
  } catch (err) {
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: err.message }) }
  }
}
