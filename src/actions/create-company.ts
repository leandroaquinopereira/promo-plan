'use server'

import { Collections } from '@promo/collections'
import { CompanyStatusEnum } from '@promo/enum/company-status'
import { CreateObjectWithCommonValues } from '@promo/utils/create-object-with-common-values'
import { generateSubstrings } from '@promo/utils/generates-substrings-to-query-search'
import { returnsDefaultActionMessage } from '@promo/utils/returns-default-action-message'
import { z } from 'zod'

import { authProcedure } from './procedures/auth-procedure'

export const createCompanyAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      name: z.string().min(1, { message: 'Nome é obrigatório' }),
    }),
  )
  .handler(async ({ input, ctx }) => {
    const { name } = input

    const searchQuery = generateSubstrings(name)
    const countQuery = await ctx.apps.firestore
      .collection(Collections.COMPANIES)
      .count()
      .get()

    const total = countQuery.data().count || 0

    await ctx.apps.firestore.collection(Collections.COMPANIES).add(
      CreateObjectWithCommonValues.create({
        name,
        status: CompanyStatusEnum.ACTIVE,
        createdBy: ctx.session.user.id,
        searchQuery: Array.from(searchQuery),
        row: total + 1,
        updatedBy: ctx.session.user.id,
      }),
    )

    return returnsDefaultActionMessage({
      message: 'Empresa cadastrada com sucesso',
      success: true,
    })
  })
