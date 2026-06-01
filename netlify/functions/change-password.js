import { auth, db, corsHeaders } from './_shared/admin.js'

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' }
  }
  try {
    const { uid, newPassword } = JSON.parse(event.body)

    await auth.updateUser(uid, { password: newPassword })

    await db.collection('users').doc(uid).update({ mustChangePassword: false })

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true })
    }
  } catch (err) {
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: err.message }) }
  }
}
