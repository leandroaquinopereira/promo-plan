'use server'

import { Collections } from '@promo/collections'
import { UserSituationEnum } from '@promo/enum/user-situation'
import { returnsDefaultActionMessage } from '@promo/utils/returns-default-action-message'
import { firestore } from 'firebase-admin'
import { z } from 'zod'

import { authProcedure } from './procedures/auth-procedure'

export const toggleUserSituationAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      userId: z.string(),
      situation: z.nativeEnum(UserSituationEnum),
    }),
  )
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
      return returnsDefaultActionMessage({
        success: false,
        message: 'User not found',
      })
    }

    await userRef.set(
      {
        situation: input.situation,
        updatedAt: firestore.Timestamp.now().toMillis(),
      },
      { merge: true },
    )

    return returnsDefaultActionMessage({
      success: true,
      message: 'User situation toggled successfully.',
    })
  })
