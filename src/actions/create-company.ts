'use server'

import { Collections } from '@promo/collections'
import { CompanyStatusEnum } from '@promo/enum/company-status'
import { serverActionOutputSchema } from '@promo/schemas/server-action-output'
import { generateSubstrings } from '@promo/utils/generates-substrings-to-query-search'
import { firestore } from 'firebase-admin'
import { z } from 'zod'

import { authProcedure } from './procedures/auth-procedure'

export const createCompanyAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      name: z.string().min(1, { message: 'Nome é obrigatório' }),
    }),
  )
  .output(serverActionOutputSchema)
  .handler(async ({ input, ctx }) => {
    const { name } = input

    const searchQuery = generateSubstrings(name)
    const countQuery = await ctx.apps.firestore
      .collection(Collections.COMPANIES)
      .count()
      .get()

    const total = countQuery.data().count || 0

    await ctx.apps.firestore.collection(Collections.COMPANIES).add({
      name,
      createdAt: firestore.Timestamp.now(),
      updatedAt: firestore.Timestamp.now(),
      status: CompanyStatusEnum.ACTIVE,
      createdBy: ctx.session.user.id,
      searchQuery: Array.from(searchQuery),
      row: total + 1,
    })

    return {
      success: true,
    }
  })
