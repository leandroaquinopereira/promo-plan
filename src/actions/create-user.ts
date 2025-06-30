'use server'

import { Collections } from '@promo/collections'
import { FirebaseErrorCode } from '@promo/constants/firebase-error-code'
import { UserSituationEnum } from '@promo/enum/user-situation'
import { getFirebaseApps } from '@promo/lib/firebase/server'
import { auth } from '@promo/lib/next-auth/auth'
import { serverActionOutputSchema } from '@promo/schemas/server-action-output'
import { hashPassword } from '@promo/utils/crypto'
import { generateSubstrings } from '@promo/utils/generates-substrings-to-query-search'
import { firestore } from 'firebase-admin'
import { z } from 'zod'
import { createServerAction } from 'zsa'

import { authProcedure } from './procedures/auth-procedure'

export const createUserAction = authProcedure
  .createServerAction()
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
  .handler(async ({ input, ctx }) => {
    const { apps, session } = ctx
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

    const totalOfUsers = await apps.firestore
      .collection(Collections.USERS)
      .count()
      .get()

    const row = (totalOfUsers.data().count || 0) + 1

    await apps.firestore
      .collection(Collections.USERS)
      .doc(phoneFormatted)
      .set({
        createdAt: firestore.Timestamp.now(),
        updatedAt: firestore.Timestamp.now(),
        createdBy: session.user.id,
        updatedBy: session.user.id,
        situation: UserSituationEnum.ACTIVE,
        role: roleRef,
        name: input.name,
        phone: phoneFormatted,
        state: input.state,
        city: input.city,
        row,
        password: hashedPassword,
        searchQuery: Array.from(new Set(searchSubstrings)),
      })

    return {
      success: true,
      message: 'User created successfully',
    }
  })
