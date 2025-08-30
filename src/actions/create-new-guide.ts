'use server'

import { Collections } from '@promo/collections'
import { FirebaseErrorCode } from '@promo/constants/firebase-error-code'
import { getFirebaseApps } from '@promo/lib/firebase/server'
import { auth } from '@promo/lib/next-auth/auth'
import { serverActionOutputSchema } from '@promo/schemas/server-action-output'
import { generateSubstrings } from '@promo/utils/generates-substrings-to-query-search'
import { firestore } from 'firebase-admin'
import { z } from 'zod'
import { createServerAction } from 'zsa'

import { authProcedure } from './procedures/auth-procedure'

export const createNewGuide = authProcedure
  .createServerAction()
  .input(
    z.object({
      title: z.string().min(1, 'Título é obrigatório'),
      description: z.string().min(1, 'Descrição é obrigatória'),
    }),
  )
  .output(
    serverActionOutputSchema.extend({
      guideId: z.string().optional(),
      message: z.string().optional(),
    }),
  )
  .handler(async ({ input, ctx }) => {
    const { title, description } = input
    const substrings = generateSubstrings(title)

    const guide = await ctx.apps.firestore.collection(Collections.GUIDES).add({
      title,
      description,
      createdAt: firestore.Timestamp.now(),
      updatedAt: firestore.Timestamp.now(),
      createdBy: ctx.session.user.id,
      updatedBy: ctx.session.user.id,
      active: true,
      documents: [],
      searchQuery: Array.from(new Set(substrings)),
    })

    return {
      success: true,
      guideId: guide.id,
      message: 'Guide created successfully',
    }
  })
