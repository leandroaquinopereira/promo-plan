import { confirmSMSCode } from '@promo/actions/confirm-sms-code'
import { resendSMSConfirmation } from '@promo/actions/resend-sms-confirmation'
import { Button } from '@promo/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@promo/components/ui/dialog'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@promo/components/ui/input-otp'
import { Label } from '@promo/components/ui/label'
import { AwsSnsErrorCode } from '@promo/constants/aws-sns-error-code'
import { FirebaseErrorCode } from '@promo/constants/firebase-error-code'
import { useRouter } from 'next/navigation'
import { useQueryState } from 'nuqs'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'

type ConfirmDialogProps = {
  isShowConfirmationDialog: boolean
  onConfirmDialogOpenChange: (isOpen: boolean) => void
  codeConfirmationId: string
  newUserPassword: string
}

export function ConfirmDialog({
  isShowConfirmationDialog,
  onConfirmDialogOpenChange,
  codeConfirmationId,
  newUserPassword,
}: ConfirmDialogProps) {
  const { isPending: isResendingConfirmationCode, execute: resend } =
    useServerAction(resendSMSConfirmation)

  const { isPending: isConfirmingCode, execute: confirm } =
    useServerAction(confirmSMSCode)

  const [phoneNumber] = useQueryState('phone', {
    defaultValue: '',
  })

  const [tries, setTries] = useState(0)

  const [countdown, setCountdown] = useState(60)
  const [code, setCode] = useState('')

  const router = useRouter()

  useEffect(() => {
    let startTime = new Date()
    let timer: NodeJS.Timeout

    if (countdown > 0) {
      timer = setInterval(() => {
        const currentTime = new Date()
        const elapsedSeconds = Math.floor(
          (currentTime.getTime() - startTime.getTime()) / 1000,
        )

        if (elapsedSeconds >= 1) {
          setCountdown((prev) => prev - 1)
          startTime = currentTime
        }
      }, 100)
    }

    return () => clearInterval(timer)
  }, [countdown])

  async function handleSendVerificationCode() {
    const [result, resultError] = await confirm({
      codeId: codeConfirmationId,
      userCode: code.trim(),
      password: newUserPassword,
    })

    if (resultError) {
      return toast.error('Erro ao verificar o número de celular', {
        description: 'Ocorreu um erro ao verificar o número de celular',
      })
    }

    if (result?.error) {
      switch (result.error.code) {
        case FirebaseErrorCode.FIREBASE_APPS_NOT_INITIALIZED:
          return toast.error('Erro ao se conectar com nossos servidores', {
            description: 'Erro ao se conectar com nossos servidores',
          })

        case FirebaseErrorCode.VERIFICATION_CODE_EXPIRED:
          return toast.error('Código de verificação expirado', {
            description:
              'O código de verificação expirou. Por favor, inicie novamente o processo de recuperação de senha.',
          })

        case FirebaseErrorCode.VERIFICATION_CODE_NOT_FOUND:
          return toast.error('Código de verificação não encontrado', {
            description:
              'O código de verificação não foi encontrado. Por favor, inicie novamente o processo de recuperação de senha.',
          })

        case FirebaseErrorCode.MAX_VERIFICATION_CODES_REACHED:
          if (tries < 3) {
            setTries((prev) => prev + 1)
          }

          return toast.error('Muitas tentativas de verificação', {
            description:
              'Você atingiu o limite de tentativas de verificação do código. Por favor, inicie novamente o processo de recuperação de senha.',
          })

        case FirebaseErrorCode.VERIFICATION_CODE_INCORRECT:
          setTries((prev) => prev + 1)
          return toast.error('Código de verificação incorreto', {
            description:
              'O código de verificação está incorreto. Por favor, tente novamente.',
          })

        default:
          return toast.error('Erro ao verificar o número de celular', {
            description: 'Ocorreu um erro ao verificar o número de celular',
          })
      }
    }

    toast.success('Código verificado com sucesso', {
      description: 'A senha foi trocada com sucesso',
    })

    router.replace('/auth/sign-in')
    onConfirmDialogOpenChange(false)
  }

  async function handleResendCode() {
    const [result, resultError] = await resend({
      codeId: codeConfirmationId,
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

        case FirebaseErrorCode.FIREBASE_APPS_NOT_INITIALIZED:
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

        case FirebaseErrorCode.VERIFICATION_CODE_EXPIRED:
          return toast.error('Código de verificação expirado', {
            description:
              'O código de verificação expirou. Por favor, inicie novamente o processo de recuperação de senha.',
          })

        case FirebaseErrorCode.VERIFICATION_CODE_NOT_FOUND:
          return toast.error('Código de verificação não encontrado', {
            description:
              'O código de verificação não foi encontrado. Por favor, inicie novamente o processo de recuperação de senha.',
          })

        default:
          return toast.error('Erro ao verificar o número de celular', {
            description: 'Ocorreu um erro ao verificar o número de celular',
          })
      }
    }

    setCountdown(60)
  }

  const isReachedMaxTries = tries >= 3

  return (
    <Dialog
      open={isShowConfirmationDialog}
      onOpenChange={onConfirmDialogOpenChange}
    >
      <DialogContent
        onInteractOutside={(event) => {
          event.preventDefault()
          event.stopPropagation()
        }}
      >
        <DialogHeader>
          <DialogTitle>Recuperação de senha</DialogTitle>
          <DialogDescription>
            Foi enviado um código de verificação para seu número de telefone{' '}
            {phoneNumber.slice(7).padStart(11, '*')}. Insira o código abaixo
            para recuperar sua senha. Você tem <strong>3 tentativas</strong>{' '}
            para inserir o código corretamente, após isso será necessário
            iniciar o processo novamente.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <Label className="mb-0.5">Código de verificação</Label>
          <InputOTP maxLength={6} onChange={setCode}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
            </InputOTPGroup>
            <InputOTPGroup>
              <InputOTPSlot index={1} />
            </InputOTPGroup>
            <InputOTPGroup>
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPGroup>
              <InputOTPSlot index={3} />
            </InputOTPGroup>
            <InputOTPGroup>
              <InputOTPSlot index={4} />
            </InputOTPGroup>
            <InputOTPGroup>
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <DialogFooter className="sm:flex-row-reverse sm:justify-start">
          <Button
            disabled={
              !code ||
              code.length < 6 ||
              isResendingConfirmationCode ||
              isReachedMaxTries
            }
            isLoading={isConfirmingCode}
            className="disabled:pointer-events-auto disabled:cursor-not-allowed w-36"
            onClick={handleSendVerificationCode}
          >
            Confirmar ({Math.abs(tries - 3)})
          </Button>
          <Button
            variant="secondary"
            onClick={handleResendCode}
            disabled={countdown > 0 || isConfirmingCode || isReachedMaxTries}
            isLoading={isResendingConfirmationCode}
            className="disabled:pointer-events-auto disabled:cursor-not-allowed"
          >
            {countdown > 0
              ? `Reenviar código (${countdown}s)`
              : 'Enviar Código'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
