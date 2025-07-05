'use server'

import { Collections } from '@promo/collections'
import { FirebaseErrorCode } from '@promo/constants/firebase-error-code'
import { CompanyStatusEnum } from '@promo/enum/company-status'
import { serverActionOutputSchema } from '@promo/schemas/server-action-output'
import { firestore } from 'firebase-admin'
import { z } from 'zod'

import { authProcedure } from './procedures/auth-procedure'

export const deleteCompanyAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .output(serverActionOutputSchema)
  .handler(async ({ input, ctx }) => {
    const { id } = input

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

    await company.ref.update({
      status: CompanyStatusEnum.DELETED,
      updatedAt: firestore.Timestamp.now(),
    })

    return {
      success: true,
    }
  })
