'use server'

import { Collections } from '@promo/collections'
import { FirebaseErrorCode } from '@promo/constants/firebase-error-code'
import { UserSituationEnum } from '@promo/enum/user-situation'
import { getFirebaseApps } from '@promo/lib/firebase/server'
import { auth } from '@promo/lib/next-auth/auth'
import { serverActionOutputSchema } from '@promo/schemas/server-action-output'
import { cleanUserId } from '@promo/utils/clean-user-id'
import { hashPassword } from '@promo/utils/crypto'
import { generateSubstrings } from '@promo/utils/generates-substrings-to-query-search'
import { firestore } from 'firebase-admin'
import { z } from 'zod'
import { createServerAction } from 'zsa'

import { authProcedure } from './procedures/auth-procedure'

export const updateUserAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      name: z.string().min(1, 'Nome é obrigatório'),
      state: z.string().min(2, 'Estado é obrigatório'),
      city: z.string().min(1, 'Cidade é obrigatória'),
      phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
      permission: z.string(),
      userId: z.string().min(1, 'ID do usuário é obrigatório'),
    }),
  )
  .output(serverActionOutputSchema)
  .handler(async ({ input, ctx }) => {
    const { apps, session } = ctx
    const phoneFormatted = cleanUserId(input.phone)
    const cleanedUserId = cleanUserId(input.userId)

    const userSavedRef = apps.firestore
      .collection(Collections.USERS)
      .doc(phoneFormatted)

    const userSaved = await userSavedRef.get()
    if (userSaved.exists && userSaved.id !== cleanedUserId) {
      return {
        success: false,
        error: {
          message: 'Usuário já cadastrado com este telefone',
          code: FirebaseErrorCode.USER_ALREADY_EXISTS,
        },
      }
    }

    const userRef = apps.firestore
      .collection(Collections.USERS)
      .doc(cleanedUserId)

    const user = await userRef.get()
    if (!user.exists) {
      return {
        success: false,
        error: {
          message: 'Usuário não encontrado',
          code: FirebaseErrorCode.OBJECT_NOT_FOUND,
        },
      }
    }

    const roleRef = apps.firestore
      .collection(Collections.ROLES)
      .doc(input.permission)

    const searchNameSubstrings = generateSubstrings(input.name)
    const searchPhoneSubstrings = generateSubstrings(phoneFormatted)

    const searchSubstrings = [...searchNameSubstrings, ...searchPhoneSubstrings]

    await apps.firestore
      .collection(Collections.USERS)
      .doc(cleanedUserId)
      .update({
        ...user.data(),
        updatedAt: firestore.Timestamp.now(),
        updatedBy: session.user.id,
        role: roleRef,
        name: input.name,
        phone: phoneFormatted,
        state: input.state,
        city: input.city,
        searchQuery: Array.from(new Set(searchSubstrings)),
      })

    return {
      success: true,
      message: 'User created successfully',
    }
  })
