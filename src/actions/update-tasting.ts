'use server'

import { Collections } from '@promo/collections'
import { buildValueForCombobox } from '@promo/utils/build-value-for-combobox'
import { extractValueFromCombobox } from '@promo/utils/extract-value-from-combobox'
import { returnsDefaultActionMessage } from '@promo/utils/returns-default-action-message'
import { firestore } from 'firebase-admin'
import { z } from 'zod'

import { authProcedure } from './procedures/auth-procedure'

export const updateTastingAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      id: z.string({
        required_error: 'ID é obrigatório',
      }),
      promoter: z.string({
        required_error: 'Promotor é obrigatório',
      }),
      company: z.string({
        required_error: 'Empresa é obrigatória',
      }),
      products: z.array(
        z.object({
          value: z.string({
            required_error: 'Produtos são obrigatórios',
          }),
          quantity: z
            .number({
              required_error: 'Quantidade é obrigatória',
            })
            .optional()
            .default(1),
        }),
      ),
      notes: z.string().optional(),
    }),
  )
  .handler(async ({ input, ctx }) => {
    const {
      id,
      promoter: promoterInput,
      company: companyInput,
      products: productsInput,
      notes,
    } = input

    const tastingRef = ctx.apps.firestore
      .collection(Collections.TASTINGS)
      .doc(id.toString())

    const tastingDoc = await tastingRef.get()
    if (!tastingDoc.exists) {
      return returnsDefaultActionMessage({
        message: 'Degustação não encontrada',
        success: false,
      })
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
      extractValueFromCombobox(product.value),
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
      return returnsDefaultActionMessage({
        message: 'Promotor, empresa ou produtos não encontrados',
        success: false,
      })
    }

    await tastingRef.update({
      promoter: {
        id: promoterId,
        name: promoter.data()?.name || '',
        email: promoter.data()?.email || '',
      },
      company: {
        id: companyId,
        name: company.data()?.name || '',
      },
      products: products.reduce((acc, product) => {
        const productQuantity = productsInput.find(
          (p) =>
            p.value ===
            buildValueForCombobox({
              label: product.data()?.name || '',
              value: product.id,
            }),
        )?.quantity

        acc.push({
          id: product.id,
          name: product.data()?.name || '',
          quantity: productQuantity || 1,
        })

        return acc
      }, [] as any[]),
      notes: notes?.trim() || '',
      updatedAt: firestore.Timestamp.now().toMillis(),
    })

    return returnsDefaultActionMessage({
      message: 'Degustação atualizado com sucesso',
      success: true,
    })
  })
