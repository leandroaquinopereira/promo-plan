'use server'

import { Collections } from '@promo/collections'
import { FirebaseErrorCode } from '@promo/constants/firebase-error-code'
import { CompanyStatusEnum } from '@promo/enum/company-status'
import { serverActionOutputSchema } from '@promo/schemas/server-action-output'
import { generateSubstrings } from '@promo/utils/generates-substrings-to-query-search'
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
  .output(serverActionOutputSchema)
  .handler(async ({ input, ctx }) => {
    const { id, name, status } = input

    const company = await ctx.apps.firestore
      .collection(Collections.COMPANIES)
      .doc(id)
      .get()

    if (!company.exists) {
      return {
        success: false,
        error: {
          code: FirebaseErrorCode.OBJECT_NOT_FOUND,
          message: 'Empresa não encontrada',
        },
      }
    }

    const searchQuery = generateSubstrings(name)

    await company.ref.update({
      searchQuery: Array.from(searchQuery),
      status,
      name,
      updatedAt: firestore.Timestamp.now(),
    })

    return {
      success: true,
    }
  })
