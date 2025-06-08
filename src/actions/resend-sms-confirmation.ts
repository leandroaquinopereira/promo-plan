'use server'

import {
  KMSThrottlingException,
  PublishCommand,
  PublishCommandInput,
  SNSClient,
} from '@aws-sdk/client-sns'
import type { VerificationCode } from '@promo/@types/firebase'
import { Collections } from '@promo/collections'
import { ActionsSuccessCodes } from '@promo/constants/actions-success-codes'
import { AwsSnsErrorCode } from '@promo/constants/aws-sns-error-code'
import { FirebaseErrorCode } from '@promo/constants/firebase-error-code'
import { env } from '@promo/env'
import { dayjsApi } from '@promo/lib/dayjs'
import { getFirebaseApps } from '@promo/lib/firebase/server'
import { generateVerificationCode } from '@promo/utils/generate-verification-code'
import { firestore } from 'firebase-admin'
import { z } from 'zod'
import { createServerAction } from 'zsa'

export const resendSMSConfirmation = createServerAction()
  .input(
    z.object({
      codeId: z.string(),
    }),
  )
  .handler(async ({ input }) => {
    const { codeId } = input

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

    const snsClient = new SNSClient({
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    })

    const commandPayload: PublishCommandInput = {
      Message: `Olá! Seu código de verificação é: ${newCode}. Use este código para redefinir sua senha.`,
      PhoneNumber: verificationCodeData.phone,
      Subject: 'Código de verificação',
      MessageAttributes: {
        'AWS.SNS.SMS.SMSType': {
          DataType: 'String',
          StringValue: 'Transactional',
        },
      },
    }

    const command = new PublishCommand(commandPayload)
    try {
      const result = await snsClient.send(command)

      await verificationCodeInFirebase.ref.update({
        ...verificationCodeData,
        code: newCode,
        sentAt: firestore.Timestamp.now(),
        smsSnsResponse: {
          MessageId: result.MessageId,
          Message: commandPayload.Message,
          PhoneNumber: commandPayload.PhoneNumber,
          Subject: commandPayload.Subject,
          MessageAttributes: commandPayload.MessageAttributes,
          metadata: JSON.stringify(result.$metadata),
        },
      } as VerificationCode)

      return {
        success: true,
        code: ActionsSuccessCodes.FIREBASE_SMS_SENT,
        message: 'SMS confirmation sent',
        codeId: verificationCodeInFirebase.id,
      }
    } catch (error) {
      if (error instanceof KMSThrottlingException) {
        return {
          success: false,
          error: {
            message: 'Rate limit exceeded for AWS KMS operations',
            code: AwsSnsErrorCode.KMS_THROTTLING_EXCEPTION,
          },
        }
      }

      if (error instanceof Error) {
        if (error.name === 'QuotaExceededException') {
          return {
            success: false,
            error: {
              message: 'SMS sending quota exceeded',
              code: AwsSnsErrorCode.QUOTA_EXCEEDED,
            },
          }
        }

        if (error.name === 'ThrottlingException') {
          return {
            success: false,
            error: {
              message: 'Too many SMS requests, please try again later',
              code: AwsSnsErrorCode.THROTTLING_EXCEPTION,
            },
          }
        }

        if (error.name === 'InvalidParameterException') {
          return {
            success: false,
            error: {
              message: 'Invalid phone number format',
              code: AwsSnsErrorCode.INVALID_PARAMETER,
            },
          }
        }

        if (error.name === 'OptedOutException') {
          return {
            success: false,
            error: {
              message: 'Phone number has opted out of receiving SMS',
              code: AwsSnsErrorCode.OPTED_OUT,
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
