'use server'

import type { Tasting } from '@promo/@types/firebase'
import { Collections } from '@promo/collections'
import { FirebaseErrorCode } from '@promo/constants/firebase-error-code'
import { TastingStatusEnum } from '@promo/enum/tasting-status'
import { serverActionOutputSchema } from '@promo/schemas/server-action-output'
import { firestore } from 'firebase-admin'
import z from 'zod'

import { authProcedure } from './procedures/auth-procedure'

export const changeTastingStatusAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      tastingId: z.string(),
      status: z.nativeEnum(TastingStatusEnum),
    }),
  )
  .output(serverActionOutputSchema)
  .handler(async ({ input, ctx }) => {
    const { tastingId, status } = input
    const tastingRef = ctx.apps.firestore
      .collection(Collections.TASTINGS)
      .doc(tastingId)

    const tasting = await tastingRef.get()
    if (!tasting.exists) {
      return {
        success: false,
        error: {
          message: 'Degustação não encontrada',
          code: FirebaseErrorCode.OBJECT_NOT_FOUND,
        },
      }
    }

    const tastingData = tasting.data() as Tasting

    if (tastingData.status === TastingStatusEnum.DELETED) {
      return {
        success: false,
        error: {
          message: 'Degustação não encontrada',
          code: FirebaseErrorCode.OBJECT_NOT_FOUND,
        },
      }
    }

    if (
      tastingData.status === TastingStatusEnum.IN_PROGRESS &&
      status === TastingStatusEnum.IN_PROGRESS
    ) {
      return {
        success: false,
        error: {
          message: 'Degustação já está em andamento',
          code: FirebaseErrorCode.INVALID_ARGUMENT,
        },
      }
    }

    const tastingLogRef = ctx.apps.firestore
      .collection(Collections.TASTING_LOGS)
      .doc()

    await tastingLogRef.set({
      tasting: tastingRef,
      status,
      createdBy: ctx.session.user.id,
      createdAt: firestore.Timestamp.now(),
    })

    await tastingRef.update({
      status,
      updatedBy: ctx.session.user.id,
      updatedAt: firestore.Timestamp.now(),
    })

    return {
      success: true,
    }
  })
