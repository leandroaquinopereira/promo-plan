'use server'

import { Collections } from '@promo/collections'
import { FirebaseErrorCode } from '@promo/constants/firebase-error-code'
import { dayjsApi } from '@promo/lib/dayjs'
import { serverActionOutputSchema } from '@promo/schemas/server-action-output'
import { extractValueFromCombobox } from '@promo/utils/extract-value-from-combobox'
import { firestore } from 'firebase-admin'
import { z } from 'zod'

import { authProcedure } from './procedures/auth-procedure'

export const updateTastingAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      id: z.number({
        required_error: 'ID é obrigatório',
      }),
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
      id,
      promoter: promoterInput,
      startDate,
      endDate,
      company: companyInput,
      products: productsInput,
      notes,
    } = input

    const tastingRef = ctx.apps.firestore
      .collection(Collections.TASTINGS)
      .doc(id.toString())

    const tastingDoc = await tastingRef.get()
    if (!tastingDoc.exists) {
      return {
        success: false,
        error: {
          message: 'Degustação não encontrada',
          code: FirebaseErrorCode.OBJECT_NOT_FOUND,
        },
      }
    }

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

    const startDateFixed = dayjsApi(startDate)
      .hour(12)
      .minute(0)
      .second(0)
      .millisecond(0)
    const endDateFixed = dayjsApi(endDate)
      .hour(12)
      .minute(0)
      .second(0)
      .millisecond(0)

    console.log('Original startDate:', startDate.toString())
    console.log('startDate ISO:', startDate.toISOString())
    console.log(
      'Firestore timestamp:',
      firestore.Timestamp.fromDate(startDate).toDate().toString(),
    )

    await tastingRef.update({
      startDate: firestore.Timestamp.fromDate(startDateFixed.toDate()),
      endDate: firestore.Timestamp.fromDate(endDateFixed.toDate()),
      promoter: promoterRef,
      company: companyRef,
      products: productsRefs,
      notes: notes?.trim() || '',
      updatedAt: firestore.Timestamp.now(),
    })

    return {
      success: true,
    }
  })
