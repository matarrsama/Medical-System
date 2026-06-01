import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

if (!getApps().length) {
  const key = process.env.FIREBASE_ADMIN_PRIVATE_KEY
  initializeApp({
    credential: cert({
      type: 'service_account',
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      privateKey: key ? key.replace(/\\n/g, '\n') : undefined,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL
    })
  })
}

export const db = getFirestore()
export const auth = getAuth()

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
}
