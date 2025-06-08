'use server'

import { Collections } from '@promo/collections'
import { ActionsSuccessCodes } from '@promo/constants/actions-success-codes'
import { FirebaseErrorCode } from '@promo/constants/firebase-error-code'
import { getFirebaseApps } from '@promo/lib/firebase/server'
import { z } from 'zod'
import { createServerAction } from 'zsa'

export const checkIfUserExists = createServerAction()
  .input(
    z.object({
      phone: z.string(),
    }),
  )
  .output(
    z.object({
      error: z
        .object({
          message: z.string(),
          code: z.string(),
        })
        .optional(),
      exists: z.enum([
        ActionsSuccessCodes.FIREBASE_USER_EXISTS,
        ActionsSuccessCodes.FIREBASE_USER_NOT_EXISTS,
      ]),
    }),
  )
  .handler(async ({ input }) => {
    const { phone } = input

    const apps = getFirebaseApps()
    if (!apps) {
      return {
        error: {
          message: 'Firebase apps not initialized',
          code: FirebaseErrorCode.FIREBASE_APPS_NOT_INITIALIZED,
        },
        exists: ActionsSuccessCodes.FIREBASE_USER_NOT_EXISTS,
      }
    }

    const { firestore } = apps
    const user = await firestore.collection(Collections.USERS).doc(phone).get()
    if (!user.exists) {
      return {
        exists: ActionsSuccessCodes.FIREBASE_USER_NOT_EXISTS,
      }
    }

    return {
      exists: ActionsSuccessCodes.FIREBASE_USER_EXISTS,
    }
  })
