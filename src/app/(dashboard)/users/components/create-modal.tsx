'use client'

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
import { Modal } from '@promo/components/ui/modal'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@promo/components/ui/select'
import { brazilianStates } from '@promo/constants/brazilian-states'
import { cn } from '@promo/lib/utils'
import { Plus } from 'lucide-react'
import { useState } from 'react'
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
    permission: z.string({
      required_error: 'Permissão é obrigatória',
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

export function CreateUserModal() {
  const [isOpen, setIsOpen] = useState(false)
  const { execute } = useServerAction(createUserAction)

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      phone: '',
      state: '',
      city: '',
      permission: '',
      password: '',
      confirmPassword: '',
    },
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

  async function handleRegisterCompany({
    name,
    phone,
    state,
    city,
    permission,
    password,
  }: Schema) {
    const [result, resultError] = await execute({
      name,
      phone,
      state,
      city,
      permission,
      password,
    })

    if (resultError) {
      toast.error('Erro ao cadastrar usuário', {
        description: resultError.message || 'Tente novamente mais tarde',
      })
      return
    }

    if (result.success) {
      toast.success(result.message)
      form.reset({
        name: '',
      })

      setIsOpen(false)
      return
    }

    toast.error('Erro ao cadastrar usuário', {
      description: result.message || 'Tente novamente mais tarde',
    })
  }

  return (
    <Modal
      title="Registrar novo usuário"
      description="Preencha as informações para registrar um novo usuário"
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <Button className="w-full @lg:w-auto" variant="default">
          <Plus className="size-4" />
          Novo Usuário
        </Button>
      }
      extraFooterContent={
        <Button
          isLoading={form.formState.isSubmitting}
          type="submit"
          form="user-creation-form"
        >
          Registrar Usuário
        </Button>
      }
    >
      <Form {...form}>
        <form
          className="space-y-4"
          id="user-creation-form"
          onSubmit={form.handleSubmit(handleRegisterCompany)}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Usuário</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Digite o nome do usuário"
                    disabled={form.formState.isSubmitting}
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
                    {...field}
                    placeholder="(XX) XXXXX-XXXX"
                    disabled={form.formState.isSubmitting}
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
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={form.formState.isSubmitting}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {brazilianStates.map((state) => (
                        <SelectItem key={state.value} value={state.value}>
                          {state.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
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
                    {...field}
                    placeholder="Digite a cidade"
                    disabled={form.formState.isSubmitting}
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
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={form.formState.isSubmitting}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione a permissão" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3UW2Xcq1kv5ZYF2ZO6cl">
                        Freelancer (Operacional)
                      </SelectItem>
                      <SelectItem value="WlHvVUKhT7jNgslshkbH">
                        Admin
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </form>
      </Form>
    </Modal>
  )
}
