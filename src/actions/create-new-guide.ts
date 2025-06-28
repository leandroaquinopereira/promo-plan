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

export const createNewGuide = createServerAction()
  .input(
    z.object({
      title: z.string().min(1, 'Título é obrigatório'),
      description: z.string().min(1, 'Descrição é obrigatória'),
      category: z.enum([
        'checklist',
        'photo_evidences',
        'reports',
        'best_practices',
        'setup',
      ]),
    }),
  )
  .output(
    serverActionOutputSchema.extend({
      guideId: z.string().optional(),
      message: z.string().optional(),
    }),
  )
  .handler(async ({ input }) => {
    const { title, description, category } = input
    const session = await auth()

    const apps = await getFirebaseApps()
    if (!apps) {
      return {
        success: false,
        error: {
          message: 'Firebase apps not initialized',
          code: FirebaseErrorCode.FIREBASE_APPS_NOT_INITIALIZED,
        },
      }
    }

    if (!session?.user) {
      return {
        success: false,
        error: {
          message: 'User not authenticated',
          code: FirebaseErrorCode.FIREBASE_APPS_NOT_INITIALIZED,
        },
      }
    }

    const substrings = generateSubstrings(title)

    const guide = await apps.firestore.collection(Collections.GUIDES).add({
      title,
      description,
      category,
      createdAt: firestore.Timestamp.now(),
      updatedAt: firestore.Timestamp.now(),
      createdBy: session.user.id,
      updatedBy: session.user.id,
      active: true,
      documents: [],
      searchQuery: Array.from(substrings),
    })

    return {
      success: true,
      guideId: guide.id,
      message: 'Guide created successfully',
    }
  })
