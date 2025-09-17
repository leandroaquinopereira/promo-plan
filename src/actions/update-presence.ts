'use server'

import { Collections } from '@promo/collections'
import { UserStatusEnum } from '@promo/enum/user-status'
import { cleanUserId } from '@promo/utils/clean-user-id'
import { returnsDefaultActionMessage } from '@promo/utils/returns-default-action-message'
import { z } from 'zod'

import { authProcedure } from './procedures/auth-procedure'

export const updateUserPresenceAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      userId: z.string().min(1, 'User ID is required'),
      situation: z.nativeEnum(UserStatusEnum).optional(),
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

    try {
      await userRef.update({
        status: input.situation || UserStatusEnum.OFFLINE,
      })

      return returnsDefaultActionMessage({
        success: true,
        message: 'User presence updated successfully',
      })
    } catch (error) {
      return returnsDefaultActionMessage({
        success: false,
        message: 'Failed to update user presence',
      })
    }
  })
