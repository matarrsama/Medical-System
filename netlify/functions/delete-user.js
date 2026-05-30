import { db, auth } from './_shared/admin.js'

export const handler = async (event) => {
  try {
    const { uid } = JSON.parse(event.body)

    await auth.deleteUser(uid)
    await db.collection('users').doc(uid).delete()

    return { statusCode: 200, body: JSON.stringify({ uid }) }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}
