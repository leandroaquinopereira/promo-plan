'use server'

import { Collections } from '@promo/collections'
import { ProductStatusEnum } from '@promo/enum/product-status'
import { generateSubstrings } from '@promo/utils/generates-substrings-to-query-search'
import { returnsDefaultActionMessage } from '@promo/utils/returns-default-action-message'
import { firestore } from 'firebase-admin'
import z from 'zod'

import { authProcedure } from './procedures/auth-procedure'

export const updateProductAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      status: z.nativeEnum(ProductStatusEnum),
    }),
  )
  .handler(async ({ input, ctx }) => {
    const { id, name, description, status } = input

    const productRef = ctx.apps.firestore
      .collection(Collections.PRODUCTS)
      .doc(id)
    const product = await productRef.get()

    if (!product.exists) {
      return returnsDefaultActionMessage({
        message: 'Produto não encontrado',
        success: false,
      })
    }

    const nameSubstrings = generateSubstrings(name)
    const descriptionSubstrings = generateSubstrings(description || '')

    const searchQuery = new Set([...nameSubstrings, ...descriptionSubstrings])

    await productRef.update({
      name,
      description,
      status,
      searchQuery: Array.from(searchQuery),
      updatedAt: firestore.Timestamp.now().toMillis(),
    })

    return returnsDefaultActionMessage({
      message: 'Produto atualizado com sucesso',
      success: true,
    })
  })
