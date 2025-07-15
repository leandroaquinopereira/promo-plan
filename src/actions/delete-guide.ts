'use server'

import { Collections } from '@promo/collections'
import { FirebaseErrorCode } from '@promo/constants/firebase-error-code'
import { getFirebaseApps } from '@promo/lib/firebase/server'
import { auth } from '@promo/lib/next-auth/auth'
import { z } from 'zod'
import { createServerAction } from 'zsa'

import { authProcedure } from './procedures/auth-procedure'

export const deleteGuideByIdAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      guideId: z.string().min(1, 'Guide ID is required'),
    }),
  )
  .handler(async ({ input, ctx }) => {
    const docRef = ctx.apps.firestore
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
