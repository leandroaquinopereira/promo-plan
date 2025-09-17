'use server'

import { Collections } from '@promo/collections'
import { ProductStatusEnum } from '@promo/enum/product-status'
import { returnsDefaultActionMessage } from '@promo/utils/returns-default-action-message'
import { firestore } from 'firebase-admin'
import { z } from 'zod'

import { authProcedure } from './procedures/auth-procedure'

export const deleteProductAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .handler(async ({ input, ctx }) => {
    const { id } = input

    const product = await ctx.apps.firestore
      .collection(Collections.PRODUCTS)
      .doc(id)
      .get()

    if (!product.exists) {
      return returnsDefaultActionMessage({
        message: 'Produto não encontrado',
        success: false,
      })
    }

    await product.ref.update({
      status: ProductStatusEnum.DELETED,
      updatedAt: firestore.Timestamp.now().toMillis(),
    })

    return returnsDefaultActionMessage({
      message: 'Produto deletado com sucesso',
      success: true,
    })
  })
