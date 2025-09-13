'use server'

import { Collections } from '@promo/collections'
import { ActionsSuccessCodes } from '@promo/constants/actions-success-codes'
import { AwsSnsErrorCode } from '@promo/constants/aws-sns-error-code'
import { FirebaseErrorCode } from '@promo/constants/firebase-error-code'
import { env } from '@promo/env'
import { dayjsApi } from '@promo/lib/dayjs'
import type { VerificationCode } from '@promo/types/firebase'
import { generateVerificationCode } from '@promo/utils/generate-verification-code'
import { firestore } from 'firebase-admin'
import twilio from 'twilio'
import { z } from 'zod'

import { publicProcedure } from './procedures/public-procedure'

export const resendSMSConfirmation = publicProcedure
  .createServerAction()
  .input(
    z.object({
      codeId: z.string(),
    }),
  )
  .handler(async ({ input, ctx }) => {
    const { codeId } = input

    const apps = ctx.apps
    const verificationCodeInFirebase = await apps.firestore
      .collection(Collections.VERIFICATION_CODES)
      .doc(codeId)
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

    const newCode = await generateVerificationCode(verificationCodeData.phone)

    const twilioClient = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN)
    const message = `Olá! Seu código de verificação é: ${newCode}. Use este código para redefinir sua senha.`

    try {
      const result = await twilioClient.messages.create({
        to: verificationCodeData.phone,
        from: env.TWILIO_PHONE_NUMBER,
        body: message,
      })

      await verificationCodeInFirebase.ref.update({
        ...verificationCodeData,
        code: newCode,
        sentAt: firestore.Timestamp.now(),
        smsSnsResponse: {
          MessageId: result.sid,
          Message: message,
          PhoneNumber: verificationCodeData.phone,
          Subject: 'Código de verificação',
          MessageAttributes: {},
          metadata: JSON.stringify(result.toJSON()),
        },
      } as VerificationCode)

      return {
        success: true,
        code: ActionsSuccessCodes.FIREBASE_SMS_SENT,
        message: 'SMS confirmation sent',
        codeId: verificationCodeInFirebase.id,
      }
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.includes('The number') &&
          error.message.includes('is unverified')
        ) {
          return {
            success: false,
            error: {
              message: 'Phone number is not verified with Twilio',
              code: AwsSnsErrorCode.INVALID_PARAMETER,
            },
          }
        }

        if (error.message.includes('The phone number provided is invalid')) {
          return {
            success: false,
            error: {
              message: 'Invalid phone number format',
              code: AwsSnsErrorCode.INVALID_PARAMETER,
            },
          }
        }

        if (error.message.includes('Account not authorized')) {
          return {
            success: false,
            error: {
              message: 'Twilio account not authorized for this operation',
              code: AwsSnsErrorCode.MESSAGE_SEND_FAILED,
            },
          }
        }

        if (error.message.includes('Insufficient funds')) {
          return {
            success: false,
            error: {
              message: 'Insufficient Twilio account balance',
              code: AwsSnsErrorCode.QUOTA_EXCEEDED,
            },
          }
        }

        if (
          error.message.includes('Rate limit exceeded') ||
          error.message.includes('Too Many Requests')
        ) {
          return {
            success: false,
            error: {
              message: 'Too many SMS requests, please try again later',
              code: AwsSnsErrorCode.THROTTLING_EXCEPTION,
            },
          }
        }

        if (
          error.message.includes('blacklisted') ||
          error.message.includes('opted out')
        ) {
          return {
            success: false,
            error: {
              message: 'Phone number has opted out of receiving SMS',
              code: AwsSnsErrorCode.OPTED_OUT,
            },
          }
        }

        if (error.message.includes('Unable to create record')) {
          return {
            success: false,
            error: {
              message: 'Failed to send SMS message',
              code: AwsSnsErrorCode.MESSAGE_SEND_FAILED,
            },
          }
        }
      }

      return {
        success: false,
        error: {
          message: 'SMS confirmation not sent',
          code: AwsSnsErrorCode.MESSAGE_SEND_FAILED,
        },
      }
    }
  })
