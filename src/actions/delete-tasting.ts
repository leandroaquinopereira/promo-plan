'use server'

import { Collections } from '@promo/collections'
import { FirebaseErrorCode } from '@promo/constants/firebase-error-code'
import { TastingStatusEnum } from '@promo/enum/tasting-status'
import { serverActionOutputSchema } from '@promo/schemas/server-action-output'
import { z } from 'zod'

import { authProcedure } from './procedures/auth-procedure'

export const deleteTastingAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .output(serverActionOutputSchema)
  .handler(async ({ input, ctx }) => {
    const { id } = input

    const tastingRef = await ctx.apps.firestore
      .collection(Collections.TASTINGS)
      .doc(id)

    const tasting = await tastingRef.get()

    if (!tasting.exists) {
      return {
        success: false,
        error: {
          message: 'Tasting not found',
          code: FirebaseErrorCode.OBJECT_NOT_FOUND,
        },
      }
    }

    await tastingRef.update({
      status: TastingStatusEnum.DELETED,
    })

    return {
      success: true,
    }
  })
