'use server'

import { Collections } from '@promo/collections'
import { TastingStatusEnum } from '@promo/enum/tasting-status'
import { buildTasks } from '@promo/factory/build-tasks'
import { dayjsApi } from '@promo/lib/dayjs'
import { extractValueFromCombobox } from '@promo/utils/extract-value-from-combobox'
import { generateId } from '@promo/utils/generate-id'
import { returnsDefaultActionMessage } from '@promo/utils/returns-default-action-message'
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
      city: z.string({
        required_error: 'Cidade é obrigatória',
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
      promoter: promoterInput,
      startDate,
      endDate,
      city,
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

    const total = await ctx.apps.firestore
      .collection(Collections.TASTINGS)
      .count()
      .get()

    const row = (total.data().count || 0) + 1
    const uid = generateId()

    await ctx.apps.firestore
      .collection(Collections.TASTINGS)
      .doc(uid)
      .set({
        createdAt: firestore.Timestamp.now().toMillis(),
        updatedAt: firestore.Timestamp.now().toMillis(),
        createdBy: ctx.session.user.id,
        row,
        status: TastingStatusEnum.DRAFT,
        promoterId: promoterId,
        promoter: {
          id: promoterId,
          name: promoter.data()?.name || '',
          email: promoter.data()?.email || '',
        },
        companyId: companyId,
        company: {
          id: companyId,
          name: company.data()?.name || '',
        },
        products: products.reduce((acc, product) => {
          const productQuantity = productsInput.find(
            (p) => p.value === product.id,
          )?.quantity

          acc.push({
            id: product.id,
            name: product.data()?.name || '',
            quantity: productQuantity || 1,
          })

          return acc
        }, [] as any[]),
        startDate: firestore.Timestamp.fromDate(startDate).toMillis(),
        endDate: firestore.Timestamp.fromDate(endDate).toMillis(),
        notes: notes?.trim() || '',
        city,
      })

    await ctx.apps.firestore.collection(Collections.TASTING_LOGS).add({
      tastingId: uid,
      tasting: {
        id: uid,
        row,
      },
      status: TastingStatusEnum.DRAFT,
      createdAt: firestore.Timestamp.now().toMillis(),
      createdBy: ctx.session.user.id,
    })

    const startDateDayjs = dayjsApi(startDate)
    const endDateDayjs = dayjsApi(endDate)

    const days = endDateDayjs.diff(startDateDayjs, 'day')

    for (let i = 0; i < days; i++) {
      const day = startDateDayjs.add(i, 'day')
      const dayInStr = day.format('YYYYMMDD')

      const packageId = `package_${uid}_day_${dayInStr}`
      const packageRef = ctx.apps.firestore
        .collection(Collections.TASTINGS)
        .doc(uid)
        .collection(Collections.TASK_PACKAGES)
        .doc(packageId)

      await packageRef.set({
        tastingId: uid,
        tasting: {
          id: uid,
          row,
        },
        createdAt: firestore.Timestamp.now().toMillis(),
        updatedAt: firestore.Timestamp.now().toMillis(),
      })

      const tasks = buildTasks(uid, packageId)
      await Promise.all(
        tasks.map((task) =>
          packageRef
            .collection(Collections.TASKS)
            .doc(task.id.toString())
            .set({
              ...task,
              tastingId: uid,
              tasting: {
                id: uid,
                row,
              },
            }),
        ),
      )
    }

    return returnsDefaultActionMessage({
      message: 'Degustação cadastrada com sucesso',
      success: true,
    })
  })
