'use server'

import { FirebaseErrorCode } from '@promo/constants/firebase-error-code'
import { ProductStatusEnum } from '@promo/enum/product-status'
import { serverActionOutputSchema } from '@promo/schemas/server-action-output'
import { generateSubstrings } from '@promo/utils/generates-substrings-to-query-search'
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
      status: z.enum([ProductStatusEnum.ACTIVE, ProductStatusEnum.INACTIVE]),
    }),
  )
  .output(serverActionOutputSchema)
  .handler(async ({ input, ctx }) => {
    const { id, name, description, status } = input

    const productRef = ctx.apps.firestore.collection('products').doc(id)
    const product = await productRef.get()

    if (!product.exists) {
      return {
        success: false,
        error: {
          code: FirebaseErrorCode.OBJECT_NOT_FOUND,
          message: 'Produto não encontrado',
        },
      }
    }

    const nameSubstrings = generateSubstrings(name)
    const descriptionSubstrings = generateSubstrings(description || '')

    const searchQuery = new Set([...nameSubstrings, ...descriptionSubstrings])

    await productRef.update({
      name,
      description,
      status,
      searchQuery: Array.from(searchQuery),
      updatedAt: firestore.Timestamp.now(),
    })

    return {
      success: true,
    }
  })
