import { db, auth } from './_shared/admin.js'

export const handler = async () => {
  try {
    const snapshot = await db.collection('users').get()
    let updated = 0
    let failed = 0
    const errors = []

    for (const doc of snapshot.docs) {
      const data = doc.data()
      const role = data.role
      if (!role) {
        failed++
        errors.push(`${data.email || doc.id}: no role field`)
        continue
      }
      try {
        await auth.setCustomUserClaims(doc.id, { role })
        updated++
      } catch (err) {
        failed++
        errors.push(`${data.email || doc.id}: ${err.message}`)
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ updated, failed, errors })
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}
