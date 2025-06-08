'use server'

import type { VerificationCode } from '@promo/@types/firebase'
import { Collections } from '@promo/collections'
import { ActionsSuccessCodes } from '@promo/constants/actions-success-codes'
import { FirebaseErrorCode } from '@promo/constants/firebase-error-code'
import { dayjsApi } from '@promo/lib/dayjs'
import { getFirebaseApps } from '@promo/lib/firebase/server'
import { hashPassword } from '@promo/utils/crypto'
import { firestore } from 'firebase-admin'
import { z } from 'zod'
import { createServerAction } from 'zsa'

export const confirmSMSCode = createServerAction()
  .input(
    z.object({
      codeId: z.string(),
      userCode: z.string(),
      password: z.string(),
    }),
  )
  .handler(async ({ input }) => {
    const apps = getFirebaseApps()
    if (!apps) {
      return {
        error: {
          message: 'Firebase apps not initialized',
          code: FirebaseErrorCode.FIREBASE_APPS_NOT_INITIALIZED,
        },
      }
    }

    const verificationCodeInFirebase = await apps.firestore
      .collection(Collections.VERIFICATION_CODES)
      .doc(input.codeId)
      .get()

    if (!verificationCodeInFirebase.exists) {
      return {
        error: {
          message: 'Verification code not found',
          code: FirebaseErrorCode.VERIFICATION_CODE_NOT_FOUND,
        },
      }
    }

    const verificationCodeData =
      verificationCodeInFirebase.data() as VerificationCode

    if (verificationCodeData.expired) {
      return {
        error: {
          message: 'Verification code is expired',
          code: FirebaseErrorCode.VERIFICATION_CODE_EXPIRED,
        },
      }
    }

    const isPassedFiveMinutes = dayjsApi(verificationCodeData.sentAt.toDate())
      .add(5, 'minutes')
      .isBefore(dayjsApi())
    if (isPassedFiveMinutes) {
      await verificationCodeInFirebase.ref.update({
        expired: true,
        expiredAt: firestore.Timestamp.now(),
      })

      return {
        error: {
          message: 'Verification code is expired',
          code: FirebaseErrorCode.VERIFICATION_CODE_EXPIRED,
        },
      }
    }

    if (verificationCodeData.tries > 3) {
      await verificationCodeInFirebase.ref.update({
        expired: true,
        expiredAt: firestore.Timestamp.now(),
      })

      return {
        error: {
          message: 'Verification code tries exceeded',
          code: FirebaseErrorCode.MAX_VERIFICATION_CODES_REACHED,
        },
      }
    }

    if (verificationCodeData.code !== input.userCode) {
      await verificationCodeInFirebase.ref.update({
        tries: verificationCodeData.tries + 1,
      })

      if (verificationCodeData.tries + 1 === 3) {
        await verificationCodeInFirebase.ref.update({
          expired: true,
          expiredAt: firestore.Timestamp.now(),
        })

        return {
          error: {
            message: 'Verification code tries exceeded',
            code: FirebaseErrorCode.MAX_VERIFICATION_CODES_REACHED,
          },
        }
      }

      return {
        error: {
          message: 'Verification code is incorrect',
          code: FirebaseErrorCode.VERIFICATION_CODE_INCORRECT,
        },
      }
    }

    await verificationCodeInFirebase.ref.update({
      verified: true,
      verifiedAt: firestore.Timestamp.now(),
    })

    try {
      const user = await apps.firestore
        .collection(Collections.USERS)
        .doc(verificationCodeData.phone.replace('+55', ''))
        .get()

      const hashedPassword = await hashPassword(input.password)
      await user.ref.update({
        password: hashedPassword,
        updatedAt: firestore.Timestamp.now(),
      })
    } catch {}

    return {
      success: true,
      code: ActionsSuccessCodes.FIREBASE_VERIFICATION_CODE_CONFIRMED,
      message: 'Verification code confirmed',
    }
  })
