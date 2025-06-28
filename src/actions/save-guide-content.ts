'use server'

import { Collections } from '@promo/collections'
import { FirebaseErrorCode } from '@promo/constants/firebase-error-code'
import { getFirebaseApps } from '@promo/lib/firebase/server'
import { auth } from '@promo/lib/next-auth/auth'
import { firestore } from 'firebase-admin'
import { z } from 'zod'
import { createServerAction } from 'zsa'

export const saveGuideContentAction = createServerAction()
  .input(
    z.object({
      guideId: z.string(),
      content: z.string(),
    }),
  )
  .handler(async ({ input }) => {
    const { guideId, content } = input
    const apps = await getFirebaseApps()
    const session = await auth()

    if (!apps) {
      return {
        success: false,
        error: {
          message: 'Firebase apps not initialized',
          code: FirebaseErrorCode.FIREBASE_APPS_NOT_INITIALIZED,
        },
      }
    }

    if (!session?.user) {
      return {
        success: false,
        error: {
          message: 'User not authenticated',
          code: FirebaseErrorCode.FIREBASE_APPS_NOT_INITIALIZED,
        },
      }
    }

    const docRef = await apps.firestore
      .collection(Collections.GUIDES)
      .doc(guideId)

    const doc = await docRef.get()
    if (!doc.exists) {
      return {
        success: false,
        error: {
          message: 'Guide not found',
          code: FirebaseErrorCode.OBJECT_NOT_FOUND,
        },
      }
    }

    await docRef.update({
      ...doc.data(),
      content,
      updatedAt: firestore.Timestamp.now(),
    })

    return {
      success: true,
      message: 'Guide content saved successfully',
    }
  })
