'use server'

import { Collections } from '@promo/collections'
import { UserSituationEnum } from '@promo/enum/user-situation'
import { cleanUserId } from '@promo/utils/clean-user-id'
import { returnsDefaultActionMessage } from '@promo/utils/returns-default-action-message'
import { firestore } from 'firebase-admin'
import { z } from 'zod'

import { authProcedure } from './procedures/auth-procedure'

export const disableUserBatchAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      users: z.array(z.string().min(1, 'User ID is required')),
    }),
  )
  .handler(async ({ input, ctx }) => {
    const { users } = input
    const cleanedUserIds = users.map((userId) => cleanUserId(userId))

    const usersRef = cleanedUserIds.map((userId) =>
      ctx.apps.firestore.collection(Collections.USERS).doc(userId),
    )

    for await (const userRef of usersRef) {
      const userDoc = await userRef.get()
      if (!userDoc.exists) {
        return returnsDefaultActionMessage({
          success: false,
          message: `User with ID ${userRef.id} not found`,
        })
      }

      await userRef.set(
        {
          situation: UserSituationEnum.INACTIVE,
          updatedAt: firestore.Timestamp.now().toMillis(),
        },
        {
          merge: true,
        },
      )
    }

    return returnsDefaultActionMessage({
      success: true,
      message: 'Users disabled successfully',
    })
  })
