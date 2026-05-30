import { db, auth } from './_shared/admin.js'

export const handler = async (event) => {
  try {
    const { users } = JSON.parse(event.body)

    const results = { created: 0, failed: 0, errors: [] }

    for (const user of users) {
      try {
        const userRecord = await auth.createUser({
          email: user.email,
          password: 'TempPass123!',
          displayName: user.name
        })

        await auth.setCustomUserClaims(userRecord.uid, { role: user.role })

        await db.collection('users').doc(userRecord.uid).set({
          uid: userRecord.uid,
          name: user.name,
          initials: user.initials,
          email: user.email,
          employeeId: user.employeeId,
          title: user.title || '',
          department: user.department,
          role: user.role,
          mfa: user.mfa || 'push',
          status: user.status || 'Active',
          avatar: user.avatar || '',
          created: user.created || new Date().toISOString().split('T')[0],
          lastActive: user.lastActive || 'Never'
        })

        results.created++
      } catch (err) {
        results.failed++
        results.errors.push(`${user.email}: ${err.message}`)
      }
    }

    return { statusCode: 200, body: JSON.stringify(results) }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}
