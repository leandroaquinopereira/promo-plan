import { initFirestore as initializeFirestore } from '@auth/firebase-adapter'
import { env } from '@promo/env'
import { AppOptions, cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

const firebaseConfig: AppOptions = {
  credential: cert({
    projectId: env.AUTH_FIREBASE_PROJECT_ID,
    clientEmail: env.AUTH_FIREBASE_CLIENT_EMAIL,
    privateKey: env.AUTH_FIREBASE_PRIVATE_KEY,
  }),
}

export const getFirebaseApps = () => {
  try {
    const existingApps = getApps()

    let app: ReturnType<typeof initializeApp>

    if (existingApps.length > 0) {
      app = existingApps[0]
    } else {
      app = initializeApp(firebaseConfig)
    }

    const auth = getAuth(app)
    const firestore = getFirestore(app)
    const storage = getStorage(app)

    return { app, auth, firestore, storage }
  } catch (error) {
    return null
  }
}

export function initFirestore() {
  return initializeFirestore({
    credential: cert({
      projectId: env.AUTH_FIREBASE_PROJECT_ID,
      clientEmail: env.AUTH_FIREBASE_CLIENT_EMAIL,
      privateKey: env.AUTH_FIREBASE_PRIVATE_KEY,
    }),
  })
}
