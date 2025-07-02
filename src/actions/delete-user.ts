'use server'

import { Collections } from '@promo/collections'
import { FirebaseErrorCode } from '@promo/constants/firebase-error-code'
import { UserSituationEnum } from '@promo/enum/user-situation'
import { serverActionOutputSchema } from '@promo/schemas/server-action-output'
import { cleanUserId } from '@promo/utils/clean-user-id'
import { z } from 'zod'

import { authProcedure } from './procedures/auth-procedure'

export const deleteUserAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      userId: z.string().min(1, 'User ID is required'),
    }),
  )
  .output(serverActionOutputSchema)
  .handler(async ({ input, ctx }) => {
    const { userId } = input

    const cleanedUserId = cleanUserId(userId)

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
        situation: UserSituationEnum.DELETED,
      },
      {
        merge: true,
      },
    )

    return {
      success: true,
      data: { message: 'User deleted successfully' },
    }
  })
