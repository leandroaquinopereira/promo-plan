'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { sendSMSConfirmation } from '@promo/actions/send-sms-confirmation'
import { PasswordField } from '@promo/components/password-field'
import { Button } from '@promo/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@promo/components/ui/form'
import { Label } from '@promo/components/ui/label'
import { AwsSnsErrorCode } from '@promo/constants/aws-sns-error-code'
import { FirebaseErrorCode } from '@promo/constants/firebase-error-code'
import { cn } from '@promo/lib/utils'
import { ArrowRight } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useServerAction } from 'zsa-react'

import { ConfirmDialog } from './confirm-dialog'

const schema = z
  .object({
    password: z
      .string({
        required_error: 'Digite sua senha',
      })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/, {
        message:
          'A senha deve conter pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial',
      }),
    confirmPassword: z.string({
      required_error: 'Confirme sua senha',
    }),
  })
  .refine(({ confirmPassword, password }) => confirmPassword === password, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type Schema = z.infer<typeof schema>

export function ResetPasswordForm() {
  const searchParams = useSearchParams()

  const [codeId, setCodeId] = useState<string>('')
  const [isShowConfirmationDialog, setIsShowConfirmationDialog] =
    useState(false)

  const { isPending, execute } = useServerAction(sendSMSConfirmation)

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    disabled: isPending || isShowConfirmationDialog,
  })

  const password = form.watch('password')
  const passwordRequirements = [
    { label: 'Pelo menos 8 caracteres', met: password?.length >= 8 },
    { label: 'Uma letra maiúscula', met: /[A-Z]/.test(password || '') },
    { label: 'Uma letra minúscula', met: /[a-z]/.test(password || '') },
    { label: 'Um número', met: /\d/.test(password || '') },
    {
      label: 'Um caractere especial',
      met: /[!@#$%^&*(),.?":{}|<>]/.test(password || ''),
    },
  ]

  async function handleChangePassword({ confirmPassword, password }: Schema) {
    if (password !== confirmPassword) {
      form.setError('confirmPassword', {
        message: 'As senhas não coincidem',
      })
      return
    }

    if (!codeId) {
      return handleSendVerificationCode()
    }

    setIsShowConfirmationDialog(true)
  }

  async function handleSendVerificationCode() {
    const phoneNumber = searchParams.get('phone')
    if (!phoneNumber) {
      return toast.warning('Problema com o telefone', {
        description:
          'Número de celular não encontrado. Por favor, retorne à tela de login e tente novamente o processo de recuperação de senha.',
      })
    }

    const [result, resultError] = await execute({
      phone: `+55${phoneNumber}`,
    })

    if (resultError) {
      return toast.error('Erro ao verificar o número de celular', {
        description: 'Ocorreu um erro ao verificar o número de celular',
      })
    }

    if (result?.error) {
      switch (result.error.code) {
        case AwsSnsErrorCode.KMS_ACCESS_DENIED_EXCEPTION:
        case AwsSnsErrorCode.KMS_KEY_NOT_FOUND_EXCEPTION:
        case AwsSnsErrorCode.KMS_INVALID_STATE_EXCEPTION:
          return toast.error('Erro ao se conectar com nossos servidores', {
            description: 'Erro ao se conectar com nossos servidores',
          })

        case AwsSnsErrorCode.INVALID_PARAMETER:
          return toast.error('Número de celular não cadastrado ou incorreto', {
            description:
              'O número de celular não está cadastrado ou está inválido, por favor cheque o número e tente novamente',
          })

        case AwsSnsErrorCode.OPTED_OUT:
          return toast.error('Número de celular não cadastrado ou incorreto', {
            description:
              'O número de celular não está cadastrado ou está inválido, por favor cheque o número e tente novamente',
          })

        case AwsSnsErrorCode.KMS_THROTTLING_EXCEPTION:
        case AwsSnsErrorCode.QUOTA_EXCEEDED:
        case AwsSnsErrorCode.THROTTLING_EXCEPTION:
          return toast.error('Muitas tentativas de envio de SMS', {
            description:
              'Você atingiu o limite de envios de SMS. Por favor, aguarde 30 minutos antes de tentar novamente.',
          })

        case AwsSnsErrorCode.MESSAGE_SEND_FAILED:
        case AwsSnsErrorCode.UNKNOWN_ERROR:
          return toast.error('Erro ao enviar o SMS', {
            description: 'Erro ao enviar o SMS',
          })

        default:
          return toast.error('Erro ao verificar o número de celular', {
            description: 'Ocorreu um erro ao verificar o número de celular',
          })
      }
    }

    setCodeId(result.codeId)
    setIsShowConfirmationDialog(true)
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleChangePassword)}
          className={cn('w-full mt-4')}
        >
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => {
              return (
                <FormItem className={cn(!password && 'mb-4')}>
                  <FormLabel>Nova senha</FormLabel>
                  <FormControl>
                    <PasswordField
                      disabled={isShowConfirmationDialog}
                      placeholder="••••••••"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )
            }}
          />

          {password && (
            <div className="space-y-2 my-4">
              <Label className="text-sm font-medium">
                Requisitos da senha:
              </Label>
              <div className="space-y-1">
                {passwordRequirements.map((req, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full',
                        req.met ? 'bg-green-500' : 'bg-gray-300',
                      )}
                    />
                    <span
                      className={cn(
                        'text-xs',
                        req.met ? 'text-green-600' : 'text-gray-500',
                      )}
                    >
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Confirme sua senha</FormLabel>
                  <FormControl>
                    <PasswordField
                      disabled={isShowConfirmationDialog}
                      placeholder="••••••••"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )
            }}
          />

          <Button
            disabled={isShowConfirmationDialog}
            isLoading={isPending}
            className="w-full mt-2"
          >
            Trocar senha <ArrowRight className="size-4" />
          </Button>
        </form>
      </Form>

      <ConfirmDialog
        isShowConfirmationDialog={isShowConfirmationDialog}
        onConfirmDialogOpenChange={setIsShowConfirmationDialog}
        newUserPassword={password}
        codeConfirmationId={codeId}
      />
    </>
  )
}
