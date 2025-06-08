'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { checkIfUserExists } from '@promo/actions/check-if-user-exists'
import { PhoneNumberField } from '@promo/components/phone-number-field'
import { Button } from '@promo/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@promo/components/ui/form'
import { ActionsSuccessCodes } from '@promo/constants/actions-success-codes'
import { ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useServerAction } from 'zsa-react'

const schema = z.object({
  phone: z
    .string({
      required_error: 'Número de celular obrigatório',
    })
    .min(1, 'Número de celular obrigatório'),
})

type Schema = z.infer<typeof schema>

export function ForgotPasswordForm() {
  const { execute, isPending } = useServerAction(checkIfUserExists)
  const router = useRouter()

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
  })

  async function handleCheckIfPhoneExists({ phone }: Schema) {
    const formattedPhone = phone.replace(/\D/g, '')

    const [result, error] = await execute({ phone: formattedPhone })
    if (error) {
      return toast.error('Erro ao verificar o número de celular', {
        description: 'Ocorreu um erro ao verificar o número de celular',
      })
    }

    if (result.error) {
      return toast.error(result.error.message, {
        description: 'Ocorreu um erro ao verificar o número de celular',
      })
    }

    if (result.exists === ActionsSuccessCodes.FIREBASE_USER_NOT_EXISTS) {
      return toast.error('Número de celular não cadastrado ou incorreto', {
        description:
          'O número de celular não está cadastrado ou está inválido, por favor cheque o número e tente novamente',
      })
    }

    router.replace(
      `/auth/forgot-password/reset-password?phone=${formattedPhone}`,
    )
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleCheckIfPhoneExists)}
        className="w-full mt-4"
      >
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <PhoneNumberField placeholder="(XX) XXXXX-XXXX" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )
          }}
        />

        <Button isLoading={isPending} className="w-full mt-2">
          Trocar senha <ArrowRight className="size-4" />
        </Button>
      </form>
    </Form>
  )
}
