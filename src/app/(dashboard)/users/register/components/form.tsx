'use client'

import { useRouter } from '@bprogress/next'
import { zodResolver } from '@hookform/resolvers/zod'
import { createUserAction } from '@promo/actions/create-user'
import { PasswordField } from '@promo/components/password-field'
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
import { Label } from '@promo/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@promo/components/ui/select'
import { brazilianStates } from '@promo/constants/brazilian-states'
import { FirebaseErrorCode } from '@promo/constants/firebase-error-code'
import { cn } from '@promo/lib/utils'
import { ArrowRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useServerAction } from 'zsa-react'

const schema = z
  .object({
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
    permission: z.enum(['freelancer', 'admin'], {
      required_error: 'Permissão é obrigatória',
      invalid_type_error: 'Selecione uma permissão válida',
    }),
    password: z
      .string({
        required_error: 'Digite sua senha',
      })
      .min(8, 'A senha deve ter pelo menos 8 caracteres')
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

type RegisterUserFormProps = {
  onSubmit?: (data: Schema) => void
}

export function RegisterUserForm({ onSubmit }: RegisterUserFormProps) {
  const { execute } = useServerAction(createUserAction)

  const router = useRouter()

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
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

  async function handleRegisterUser({
    city,
    name,
    password,
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
        password,
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
            message = 'Guia não encontrado. Por favor, recarregue a página.'
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

        toast.error(`Erro ao salvar usuário.`, {
          description: message,
        })

        return
      }

      toast.success('Usuário cadastrado com sucesso!', {
        description: 'O usuário foi criado e pode fazer login no sistema.',
      })

      onSubmit?.({
        name,
        phone,
        state,
        city,
        permission,
        password,
        confirmPassword: password, // confirmPassword is not used in the action
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
        onSubmit={form.handleSubmit(handleRegisterUser)}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className={cn(!password && 'md:col-span-2')}>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <PasswordField
                    placeholder="••••••••"
                    disabled={form.formState.isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {password && (
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirme sua senha</FormLabel>
                  <FormControl>
                    <PasswordField
                      placeholder="••••••••"
                      disabled={form.formState.isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {password && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Requisitos da senha:</Label>
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

        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={form.formState.isSubmitting}
            onClick={() => form.reset()}
          >
            Limpar formulário
          </Button>
          <Button
            type="submit"
            className="flex-1"
            isLoading={form.formState.isSubmitting}
          >
            Cadastrar usuário <ArrowRight className="size-4" />
          </Button>
        </div>
      </form>
    </Form>
  )
}
