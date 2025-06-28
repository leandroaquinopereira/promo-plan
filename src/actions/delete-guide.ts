'use server'

import { Collections } from '@promo/collections'
import { FirebaseErrorCode } from '@promo/constants/firebase-error-code'
import { getFirebaseApps } from '@promo/lib/firebase/server'
import { auth } from '@promo/lib/next-auth/auth'
import { z } from 'zod'
import { createServerAction } from 'zsa'

export const deleteGuideByIdAction = createServerAction()
  .input(
    z.object({
      guideId: z.string().min(1, 'Guide ID is required'),
    }),
  )
  .handler(async ({ input }) => {
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

    const docRef = apps.firestore
      .collection(Collections.GUIDES)
      .doc(input.guideId)
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

    await docRef.delete()

    return {
      success: true,
      message: 'Guide deleted successfully',
    }
  })
