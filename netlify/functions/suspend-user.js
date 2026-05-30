import { db, auth } from './_shared/admin.js'

export const handler = async (event) => {
  try {
    const { uid, status } = JSON.parse(event.body)

    if (status === 'Suspended') {
      await auth.updateUser(uid, { disabled: true })
    } else {
      await auth.updateUser(uid, { disabled: false })
    }

    await db.collection('users').doc(uid).update({ status })

    return { statusCode: 200, body: JSON.stringify({ uid, status }) }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}
