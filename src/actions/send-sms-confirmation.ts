'use server'

import { Collections } from '@promo/collections'
import { ActionsSuccessCodes } from '@promo/constants/actions-success-codes'
import { AwsSnsErrorCode } from '@promo/constants/aws-sns-error-code'
import { env } from '@promo/env'
import type { VerificationCode } from '@promo/types/firebase'
import { generateVerificationCode } from '@promo/utils/generate-verification-code'
import { firestore } from 'firebase-admin'
import twilio from 'twilio'
import { z } from 'zod'

import { publicProcedure } from './procedures/public-procedure'

export const sendSMSConfirmation = publicProcedure
  .createServerAction()
  .input(
    z.object({
      phone: z.string(),
    }),
  )
  .handler(async ({ input, ctx }) => {
    const { phone } = input

    const apps = ctx.apps

    const verificationCode = await generateVerificationCode(phone)

    const twilioClient = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN)

    const message = `Olá! Seu código de verificação é: ${verificationCode}. Use este código para redefinir sua senha.`

    try {
      const result = await twilioClient.messages.create({
        to: phone,
        from: env.TWILIO_PHONE_NUMBER,
        body: message,
      })

      const coll = apps.firestore.collection(Collections.VERIFICATION_CODES)
      const document = await coll.add({
        sentAt: firestore.Timestamp.now(),
        phone,
        code: verificationCode,
        verified: false,
        verifiedAt: '',
        tries: 0,
        smsSnsResponse: {
          MessageId: result.sid,
          Message: message,
          PhoneNumber: phone,
          Subject: 'Código de verificação',
          MessageAttributes: {},
          metadata: JSON.stringify(result.toJSON()),
        },
      } as VerificationCode)

      return {
        success: true,
        code: ActionsSuccessCodes.FIREBASE_SMS_SENT,
        message: 'SMS confirmation sent',
        codeId: document.id,
      }
    } catch (error) {
      if (error instanceof Error) {
        // Twilio specific errors
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

        if (error.message.includes('Permission to send an SMS')) {
          return {
            success: false,
            error: {
              message: 'No permission to send SMS to this number',
              code: AwsSnsErrorCode.OPTED_OUT,
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
              message: 'Insufficient funds in Twilio account',
              code: AwsSnsErrorCode.QUOTA_EXCEEDED,
            },
          }
        }

        if (error.message.includes('Rate limit')) {
          return {
            success: false,
            error: {
              message: 'Rate limit exceeded, please try again later',
              code: AwsSnsErrorCode.THROTTLING_EXCEPTION,
            },
          }
        }

        // Generic Twilio error handling
        if (error.name === 'TwilioError' || error.message.includes('Twilio')) {
          return {
            success: false,
            error: {
              message: `Twilio error: ${error.message}`,
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
