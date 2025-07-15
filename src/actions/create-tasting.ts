'use server'

import { Collections } from '@promo/collections'
import { FirebaseErrorCode } from '@promo/constants/firebase-error-code'
import { TastingStatusEnum } from '@promo/enum/tasting-status'
import { serverActionOutputSchema } from '@promo/schemas/server-action-output'
import { extractValueFromCombobox } from '@promo/utils/extract-value-from-combobox'
import { firestore } from 'firebase-admin'
import { z } from 'zod'

import { authProcedure } from './procedures/auth-procedure'

export const createTastingAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      promoter: z.string({
        required_error: 'Promotor é obrigatório',
      }),
      startDate: z.coerce.date({
        required_error: 'Data de início é obrigatória',
      }),
      endDate: z.coerce.date({
        required_error: 'Data de término é obrigatória',
      }),
      company: z.string({
        required_error: 'Empresa é obrigatória',
      }),
      products: z.array(
        z.string({
          required_error: 'Produtos são obrigatórios',
        }),
      ),
      notes: z.string().optional(),
    }),
  )
  .output(serverActionOutputSchema)
  .handler(async ({ input, ctx }) => {
    const {
      promoter: promoterInput,
      startDate,
      endDate,
      company: companyInput,
      products: productsInput,
      notes,
    } = input

    const promoterId = extractValueFromCombobox(promoterInput)
    const promoterRef = ctx.apps.firestore
      .collection(Collections.USERS)
      .doc(promoterId)

    const companyId = extractValueFromCombobox(companyInput)
    const companyRef = ctx.apps.firestore
      .collection(Collections.COMPANIES)
      .doc(companyId)

    const productsIds = productsInput.map((product) =>
      extractValueFromCombobox(product),
    )

    const productsRefs = productsIds.map((productId) =>
      ctx.apps.firestore.collection(Collections.PRODUCTS).doc(productId),
    )

    const [promoter, company, products] = await Promise.all([
      promoterRef.get(),
      companyRef.get(),
      Promise.all(productsRefs.map((product) => product.get())),
    ])

    const objects = [promoter, company, ...products]

    if (objects.some((obj) => !obj.exists)) {
      return {
        success: false,
        error: {
          message: 'Promotor, empresa ou produtos não encontrados',
          code: FirebaseErrorCode.OBJECT_NOT_FOUND,
        },
      }
    }

    const total = await ctx.apps.firestore
      .collection(Collections.TASTINGS)
      .count()
      .get()

    const row = (total.data().count || 0) + 1

    await ctx.apps.firestore
      .collection(Collections.TASTINGS)
      .doc(row.toString())
      .set({
        createdAt: firestore.Timestamp.now(),
        updatedAt: firestore.Timestamp.now(),
        createdBy: ctx.session.user.id,
        row,
        status: TastingStatusEnum.DRAFT,
        promoter: promoterRef,
        company: companyRef,
        products: productsRefs,
        startDate: firestore.Timestamp.fromDate(startDate),
        endDate: firestore.Timestamp.fromDate(endDate),
        notes: notes?.trim() || '',
      })

    return {
      success: true,
    }
  })
