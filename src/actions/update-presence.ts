'use server'

import { Collections } from '@promo/collections'
import { FirebaseErrorCode } from '@promo/constants/firebase-error-code'
import { UserStatusEnum } from '@promo/enum/user-status'
import { cleanUserId } from '@promo/utils/clean-user-id'
import { z } from 'zod'

import { authProcedure } from './procedures/auth-procedure'

export const updateUserPresenceAction = authProcedure
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
      return {
        success: false,
        code: FirebaseErrorCode.USER_NOT_FOUND,
      }
    }

    try {
      await userRef.update({
        status: UserStatusEnum.ONLINE,
      })

      return {
        success: true,
        message: 'User presence updated successfully',
      }
    } catch (error) {
      return {
        success: false,
        code: FirebaseErrorCode.UNKNOWN_ERROR,
        message: 'Failed to update user presence',
      }
    }
  })
