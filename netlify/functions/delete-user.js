import { db, auth, corsHeaders } from './_shared/admin.js'

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' }
  }
  try {
    const { uid } = JSON.parse(event.body)

    await auth.deleteUser(uid)
    await db.collection('users').doc(uid).delete()

    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ uid }) }
  } catch (err) {
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: err.message }) }
  }
}
