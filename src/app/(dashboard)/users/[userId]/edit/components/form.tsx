'use client'

import { useRouter } from '@bprogress/next'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateUserAction } from '@promo/actions/update-user'
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
import { Input } from '@promo/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@promo/components/ui/select'
import { brazilianStates } from '@promo/constants/brazilian-states'
import { FirebaseErrorCode } from '@promo/constants/firebase-error-code'
import { ArrowRight } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useServerAction } from 'zsa-react'

const schema = z.object({
  name: z
    .string({
      required_error: 'Nome é obrigatório',
    })
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  phone: z
    .string({
      required_error: 'Telefone é obrigatório',
    })
    .min(1, 'Telefone é obrigatório'),
  state: z
    .string({
      required_error: 'Estado é obrigatório',
    })
    .min(1, 'Estado é obrigatório'),
  city: z
    .string({
      required_error: 'Cidade é obrigatória',
    })
    .min(2, 'Cidade deve ter pelo menos 2 caracteres')
    .max(100, 'Cidade deve ter no máximo 100 caracteres'),
  permission: z.string({
    required_error: 'Permissão é obrigatória',
    invalid_type_error: 'Selecione uma permissão válida',
  }),
})

type Schema = z.infer<typeof schema>

type EditUserFormProps = {
  onSubmit?: (data: Schema) => void
  defaultValues?: Partial<Schema>
}

export function EditUserForm({ onSubmit, defaultValues }: EditUserFormProps) {
  const { execute } = useServerAction(updateUserAction)

  const router = useRouter()

  const { userId } = useParams()

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  async function handleUpdateUser({
    city,
    name,
    phone,
    state,
    permission,
  }: Schema) {
    try {
      const [result, resultError] = await execute({
        name,
        phone,
        state,
        city,
        permission,
        userId: userId as string,
      })

      if (resultError) {
        toast.error(`Erro ao salvar usuário.`, {
          description:
            resultError.message || 'Erro desconhecido ao salvar usuário.',
        })

        return
      }

      if (!result.success) {
        let message = 'Erro desconhecido ao salvar usuário.'
        switch (result.error?.code) {
          case FirebaseErrorCode.OBJECT_NOT_FOUND:
            message = 'Usuário não encontrado. Por favor, recarregue a página.'
            break
          case FirebaseErrorCode.FIREBASE_APPS_NOT_INITIALIZED:
            message =
              'Aplicativos Firebase não inicializados. Por favor, recarregue a página.'
            break
          case FirebaseErrorCode.USER_NOT_FOUND:
            message =
              'Usuário não autenticado. Por favor, faça login novamente.'
            break
          case FirebaseErrorCode.USER_ALREADY_EXISTS:
            message = 'Já existe um usuário cadastrado com este telefone.'
            form.setError('phone', {
              type: 'manual',
              message,
            })

            break
          default:
            break
        }

        toast.error(`Erro ao salvar guia.`, {
          description: message,
        })

        return
      }

      toast.success('Usuário atualizado com sucesso!', {
        description: 'O usuário foi atualizado e pode fazer login no sistema.',
      })

      onSubmit?.({
        name,
        phone,
        state,
        city,
        permission,
      })

      form.reset()
      router.push('/users')
    } catch (error) {
      toast.error('Erro ao cadastrar usuário', {
        description: 'Ocorreu um erro inesperado. Tente novamente.',
      })
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleUpdateUser)}
        className="space-y-6 @container"
      >
        <div className="grid grid-cols-1 @md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome completo</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Digite o nome completo"
                    disabled={form.formState.isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <PhoneNumberField
                    placeholder="(XX) XXXXX-XXXX"
                    disabled={form.formState.isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={form.formState.isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {brazilianStates.map((state) => (
                      <SelectItem key={state.value} value={state.value}>
                        {state.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cidade</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Digite a cidade"
                    disabled={form.formState.isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="permission"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Permissão</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={form.formState.isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione a permissão" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="3UW2Xcq1kv5ZYF2ZO6cl">
                      Freelancer (Operacional)
                    </SelectItem>
                    <SelectItem value="WlHvVUKhT7jNgslshkbH">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={form.formState.isSubmitting}
            onClick={() => router.back()}
          >
            Voltar
          </Button>
          <Button
            type="submit"
            className="flex-1"
            isLoading={form.formState.isSubmitting}
          >
            Atualizar usuário <ArrowRight className="size-4" />
          </Button>
        </div>
      </form>
    </Form>
  )
}
