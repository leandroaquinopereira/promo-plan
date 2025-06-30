'use server'

import { Collections } from '@promo/collections'
import { ActionsSuccessCodes } from '@promo/constants/actions-success-codes'
import { FirebaseErrorCode } from '@promo/constants/firebase-error-code'
import { getFirebaseApps } from '@promo/lib/firebase/server'
import { z } from 'zod'
import { createServerAction } from 'zsa'

import { publicProcedure } from './procedures/public-procedure'

export const checkIfUserExists = publicProcedure
  .createServerAction()
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
  .handler(async ({ input, ctx }) => {
    const { phone } = input

    const { firestore } = ctx.apps
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
