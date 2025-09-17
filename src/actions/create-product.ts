'use server'

import { Collections } from '@promo/collections'
import { ProductStatusEnum } from '@promo/enum/product-status'
import { CreateObjectWithCommonValues } from '@promo/utils/create-object-with-common-values'
import { generateSubstrings } from '@promo/utils/generates-substrings-to-query-search'
import { returnsDefaultActionMessage } from '@promo/utils/returns-default-action-message'
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
  .handler(async ({ input, ctx }) => {
    const { name, description } = input

    const nameSubstrings = generateSubstrings(name)
    const descriptionSubstrings = generateSubstrings(description || '')

    const searchQuery = new Set([...nameSubstrings, ...descriptionSubstrings])
    const total = await ctx.apps.firestore
      .collection(Collections.PRODUCTS)
      .count()
      .get()

    const row = (total.data().count || 0) + 1

    await ctx.apps.firestore.collection(Collections.PRODUCTS).add(
      CreateObjectWithCommonValues.create({
        name,
        description,
        status: ProductStatusEnum.ACTIVE,
        searchQuery: Array.from(searchQuery),
        row,
        createdBy: ctx.session.user.id,
        updatedBy: ctx.session.user.id,
      }),
    )

    return returnsDefaultActionMessage({
      message: 'Produto cadastrado com sucesso',
      success: true,
    })
  })
