import admin from 'firebase-admin'

if (!admin.apps.length) {
  const key = process.env.FIREBASE_ADMIN_PRIVATE_KEY
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      privateKey: key ? key.replace(/\\n/g, '\n') : undefined,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL
    })
  })
}

export const db = admin.firestore()
export const auth = admin.auth()
export default admin
