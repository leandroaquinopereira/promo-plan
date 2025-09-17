'use server'

import { Collections } from '@promo/collections'
import { CompanyStatusEnum } from '@promo/enum/company-status'
import { generateSubstrings } from '@promo/utils/generates-substrings-to-query-search'
import { returnsDefaultActionMessage } from '@promo/utils/returns-default-action-message'
import { firestore } from 'firebase-admin'
import { z } from 'zod'

import { authProcedure } from './procedures/auth-procedure'

export const updateCompanyAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      id: z.string(),
      name: z.string(),
      status: z.nativeEnum(CompanyStatusEnum),
    }),
  )
  .handler(async ({ input, ctx }) => {
    const { id, name, status } = input

    const company = await ctx.apps.firestore
      .collection(Collections.COMPANIES)
      .doc(id)
      .get()

    if (!company.exists) {
      return returnsDefaultActionMessage({
        message: 'Empresa não encontrada',
        success: false,
      })
    }

    const searchQuery = generateSubstrings(name)

    await company.ref.update({
      searchQuery: Array.from(searchQuery),
      status,
      name,
      updatedAt: firestore.Timestamp.now().toMillis(),
    })

    return returnsDefaultActionMessage({
      message: 'Empresa atualizada com sucesso',
      success: true,
    })
  })
