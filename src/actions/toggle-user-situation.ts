'use server'

import { Collections } from '@promo/collections'
import { FirebaseErrorCode } from '@promo/constants/firebase-error-code'
import { getFirebaseApps } from '@promo/lib/firebase/server'
import { auth } from '@promo/lib/next-auth/auth'
import { serverActionOutputSchema } from '@promo/schemas/server-action-output'
import { z } from 'zod'
import { createServerAction } from 'zsa'

import { authProcedure } from './procedures/auth-procedure'

export const toggleUserSituationAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      userId: z.string(),
      situation: z.enum(['active', 'inactive']),
    }),
  )
  .output(serverActionOutputSchema)
  .handler(async ({ input, ctx }) => {
    const cleanedUserId = input.userId
      .trim()
      .replace(/\D/g, '')
      .replace(/\+55/g, '')

    const userRef = ctx.apps.firestore
      .collection(Collections.USERS)
      .doc(cleanedUserId)

    const userDoc = await userRef.get()
    if (!userDoc.exists) {
      return {
        success: false,
        error: {
          code: FirebaseErrorCode.USER_NOT_FOUND,
          message: 'User not found',
        },
      }
    }

    await userRef.set(
      {
        situation: input.situation,
      },
      { merge: true },
    )

    return {
      success: true,
      message: 'User situation toggled successfully.',
    }
  })
