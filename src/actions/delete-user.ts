'use server'

import { Collections } from '@promo/collections'
import { UserSituationEnum } from '@promo/enum/user-situation'
import { cleanUserId } from '@promo/utils/clean-user-id'
import { returnsDefaultActionMessage } from '@promo/utils/returns-default-action-message'
import { firestore } from 'firebase-admin'
import { z } from 'zod'

import { authProcedure } from './procedures/auth-procedure'

export const deleteUserAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      userId: z.string().min(1, 'User ID is required'),
    }),
  )
  .handler(async ({ input, ctx }) => {
    const { userId } = input

    const cleanedUserId = cleanUserId(userId)

    const userRef = ctx.apps.firestore
      .collection(Collections.USERS)
      .doc(cleanedUserId)

    const userDoc = await userRef.get()
    if (!userDoc.exists) {
      return returnsDefaultActionMessage({
        success: false,
        message: 'User not found',
      })
    }

    if (userDoc.data()?.situation === UserSituationEnum.ACTIVE) {
      return returnsDefaultActionMessage({
        success: false,
        message: `User with ID ${userRef.id} is not disabled and cannot be deleted`,
      })
    }

    await userRef.set(
      {
        situation: UserSituationEnum.DELETED,
        updatedAt: firestore.Timestamp.now().toMillis(),
      },
      {
        merge: true,
      },
    )

    return returnsDefaultActionMessage({
      success: true,
      message: 'User deleted successfully',
    })
  })
