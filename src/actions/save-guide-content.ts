'use server'

import { Collections } from '@promo/collections'
import { FirebaseErrorCode } from '@promo/constants/firebase-error-code'
import { getFirebaseApps } from '@promo/lib/firebase/server'
import { auth } from '@promo/lib/next-auth/auth'
import { firestore } from 'firebase-admin'
import { z } from 'zod'
import { createServerAction } from 'zsa'

import { authProcedure } from './procedures/auth-procedure'

export const saveGuideContentAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      guideId: z.string(),
      content: z.string(),
    }),
  )
  .handler(async ({ input, ctx }) => {
    const { guideId, content } = input

    const docRef = ctx.apps.firestore
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
