'use server'

import { Collections } from '@promo/collections'
import { cleanUserId } from '@promo/utils/clean-user-id'
import { generateSubstrings } from '@promo/utils/generates-substrings-to-query-search'
import { returnsDefaultActionMessage } from '@promo/utils/returns-default-action-message'
import { firestore } from 'firebase-admin'
import { z } from 'zod'

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
  .handler(async ({ input, ctx }) => {
    const { apps, session } = ctx
    const phoneFormatted = cleanUserId(input.phone)
    const cleanedUserId = cleanUserId(input.userId)

    const userSavedRef = apps.firestore
      .collection(Collections.USERS)
      .doc(phoneFormatted)

    const userSaved = await userSavedRef.get()
    if (userSaved.exists && userSaved.id !== cleanedUserId) {
      return returnsDefaultActionMessage({
        success: false,
        message: 'Usuário já cadastrado com este telefone',
      })
    }

    const userRef = apps.firestore
      .collection(Collections.USERS)
      .doc(cleanedUserId)

    const user = await userRef.get()
    if (!user.exists) {
      return returnsDefaultActionMessage({
        success: false,
        message: 'Usuário não encontrado',
      })
    }

    const roleRef = await apps.firestore
      .collection(Collections.ROLES)
      .doc(input.permission)
      .get()

    if (!roleRef.exists) {
      return returnsDefaultActionMessage({
        success: false,
        message: 'Permissão não encontrada',
      })
    }

    const searchNameSubstrings = generateSubstrings(input.name)
    const searchPhoneSubstrings = generateSubstrings(phoneFormatted)

    const searchSubstrings = [...searchNameSubstrings, ...searchPhoneSubstrings]

    await apps.firestore
      .collection(Collections.USERS)
      .doc(cleanedUserId)
      .update({
        ...user.data(),
        updatedAt: firestore.Timestamp.now().toMillis(),
        updatedBy: session.user.id,
        role: {
          id: input.permission,
          name: roleRef.data()?.name || '',
        },
        name: input.name,
        phone: phoneFormatted,
        state: input.state,
        city: input.city,
        searchQuery: Array.from(new Set(searchSubstrings)),
      })

    return returnsDefaultActionMessage({
      success: true,
      message: 'Usuário atualizado com sucesso',
    })
  })
