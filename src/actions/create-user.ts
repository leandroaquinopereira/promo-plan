'use server'

import { Collections } from '@promo/collections'
import { FirebaseErrorCode } from '@promo/constants/firebase-error-code'
import { getFirebaseApps } from '@promo/lib/firebase/server'
import { auth } from '@promo/lib/next-auth/auth'
import { serverActionOutputSchema } from '@promo/schemas/server-action-output'
import { hashPassword } from '@promo/utils/crypto'
import { generateSubstrings } from '@promo/utils/generates-substrings-to-query-search'
import { firestore } from 'firebase-admin'
import { z } from 'zod'
import { createServerAction } from 'zsa'

export const createUserAction = createServerAction()
  .input(
    z.object({
      name: z.string().min(1, 'Nome é obrigatório'),
      password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
      state: z.string().min(2, 'Estado é obrigatório'),
      city: z.string().min(1, 'Cidade é obrigatória'),
      phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
      permission: z.enum(['admin', 'freelancer'], {
        errorMap: () => ({ message: 'Permissão inválida' }),
      }),
    }),
  )
  .output(serverActionOutputSchema)
  .handler(async ({ input }) => {
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

    const phoneFormatted = input.phone.replace(/\D/g, '').replace('+55', '')

    const userSavedRef = apps.firestore
      .collection(Collections.USERS)
      .doc(phoneFormatted)

    const userSaved = await userSavedRef.get()
    if (userSaved.exists) {
      return {
        success: false,
        error: {
          message: 'Usuário já cadastrado com este telefone',
          code: FirebaseErrorCode.USER_ALREADY_EXISTS,
        },
      }
    }

    const roleRef = apps.firestore
      .collection(Collections.ROLES)
      .doc(input.permission)

    const searchNameSubstrings = generateSubstrings(input.name)
    const searchPhoneSubstrings = generateSubstrings(phoneFormatted)

    const searchSubstrings = [...searchNameSubstrings, ...searchPhoneSubstrings]
    const hashedPassword = await hashPassword(input.password)

    await apps.firestore
      .collection(Collections.USERS)
      .doc(phoneFormatted)
      .set({
        createdAt: firestore.Timestamp.now(),
        updatedAt: firestore.Timestamp.now(),
        createdBy: session.user.id,
        updatedBy: session.user.id,
        active: true,
        role: roleRef,
        name: input.name,
        phone: phoneFormatted,
        state: input.state,
        city: input.city,
        password: hashedPassword,
        searchQuery: Array.from(new Set(searchSubstrings)),
      })

    return {
      success: true,
      message: 'User created successfully',
    }
  })
