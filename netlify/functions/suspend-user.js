import { db, auth, corsHeaders } from './_shared/admin.js'

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' }
  }
  try {
    const { uid, status } = JSON.parse(event.body)

    if (status === 'Suspended') {
      await auth.updateUser(uid, { disabled: true })
    } else {
      await auth.updateUser(uid, { disabled: false })
    }

    await db.collection('users').doc(uid).update({ status })

    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ uid, status }) }
  } catch (err) {
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: err.message }) }
  }
}
