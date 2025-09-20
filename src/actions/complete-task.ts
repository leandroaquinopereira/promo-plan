'use server'

import { Collections } from '@promo/collections'
import { TastingStatusEnum } from '@promo/enum/tasting-status'
import { dayjsApi } from '@promo/lib/dayjs'
import { serverActionOutputSchema } from '@promo/schemas/server-action-output'
import { firestore } from 'firebase-admin'
import { z } from 'zod'

import { authProcedure } from './procedures/auth-procedure'

export const completeTaskAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      taskId: z.string(),
      taskTastingId: z.string(),
      packageId: z.string(),
      metadata: z.record(z.string(), z.any()),
      payload: z.record(z.string(), z.any()),
    }),
  )
  .output(serverActionOutputSchema)
  .handler(async ({ input, ctx }) => {
    const { taskId, taskTastingId, packageId, metadata, payload } = input
    const tasting = await ctx.apps.firestore
      .collection(Collections.TASTINGS)
      .doc(taskTastingId)
      .get()

    const taskRef = ctx.apps.firestore
      .collection(Collections.TASTINGS)
      .doc(taskTastingId)
      .collection(Collections.TASK_PACKAGES)
      .doc(packageId)
      .collection(Collections.TASKS)
      .doc(taskId)

    await taskRef.update({
      completedAt: firestore.Timestamp.now().toMillis(),
      completedBy: ctx.session.user.id,
      metadata,
      payload,
    })

    await ctx.apps.firestore.collection(Collections.TASTING_LOGS).add({
      tasting: {
        id: tasting.id,
        row: tasting.data()?.row,
      },
      status: TastingStatusEnum.IN_PROGRESS,
      createdAt: firestore.Timestamp.now().toMillis(),
      message: 'Tarefa concluída',
      metadata,
      payload,
      createdBy: ctx.session.user.id,
    })

    return {
      success: true,
    }
  })
