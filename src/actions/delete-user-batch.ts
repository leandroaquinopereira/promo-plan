'use server'

import { Collections } from '@promo/collections'
import { FirebaseErrorCode } from '@promo/constants/firebase-error-code'
import { UserSituationEnum } from '@promo/enum/user-situation'
import { serverActionOutputSchema } from '@promo/schemas/server-action-output'
import { cleanUserId } from '@promo/utils/clean-user-id'
import { z } from 'zod'

import { authProcedure } from './procedures/auth-procedure'

export const deleteUserBatchAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      users: z.array(z.string().min(1, 'User ID is required')),
    }),
  )
  .output(serverActionOutputSchema)
  .handler(async ({ input, ctx }) => {
    const { users } = input
    const cleanedUserIds = users.map((userId) => cleanUserId(userId))

    const usersRef = cleanedUserIds.map((userId) =>
      ctx.apps.firestore.collection(Collections.USERS).doc(userId),
    )

    for await (const userRef of usersRef) {
      const userDoc = await userRef.get()
      if (!userDoc.exists) {
        return {
          success: false,
          error: {
            code: FirebaseErrorCode.USER_NOT_FOUND,
            message: `User with ID ${userRef.id} not found`,
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
    }

    return {
      success: true,
      data: { message: 'Users deleted successfully' },
    }
  })
