'use server'

import { Collections } from '@promo/collections'
import { ProductStatusEnum } from '@promo/enum/product-status'
import { serverActionOutputSchema } from '@promo/schemas/server-action-output'
import { generateSubstrings } from '@promo/utils/generates-substrings-to-query-search'
import { firestore } from 'firebase-admin'
import { z } from 'zod'

import { authProcedure } from './procedures/auth-procedure'

export const createProductAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      name: z.string().min(1, { message: 'Nome é obrigatório' }),
      description: z.string().optional(),
    }),
  )
  .output(serverActionOutputSchema)
  .handler(async ({ input, ctx }) => {
    const { name, description } = input

    const nameSubstrings = generateSubstrings(name)
    const descriptionSubstrings = generateSubstrings(description || '')

    const searchQuery = new Set([...nameSubstrings, ...descriptionSubstrings])
    const total = await ctx.apps.firestore
      .collection(Collections.PRODUCTS)
      .count()
      .get()

    await ctx.apps.firestore.collection(Collections.PRODUCTS).add({
      name,
      description,
      status: ProductStatusEnum.ACTIVE,
      searchQuery: Array.from(searchQuery),
      row: (total.data().count || 0) + 1,
      createdAt: firestore.Timestamp.now(),
      updatedAt: firestore.Timestamp.now(),
      createdBy: ctx.session.user.id,
    })

    return {
      success: true,
    }
  })
