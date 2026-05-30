import { auth } from './_shared/admin.js'

export const handler = async (event) => {
  try {
    const { uid } = JSON.parse(event.body)

    const tempPassword = Array.from({ length: 8 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 62)]).join('')
    await auth.updateUser(uid, { password: tempPassword })

    const userRecord = await auth.getUser(uid)

    return {
      statusCode: 200,
      body: JSON.stringify({ tempPassword, email: userRecord.email })
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}
