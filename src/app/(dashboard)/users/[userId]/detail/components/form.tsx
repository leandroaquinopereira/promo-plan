'use client'

import { useRouter } from '@bprogress/next'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { ArrowRight } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

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

type DetailUserFormProps = {
  defaultValues?: Partial<Schema>
}

export function DetailUserForm({ defaultValues }: DetailUserFormProps) {
  const router = useRouter()

  const { userId } = useParams()

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  return (
    <Form {...form}>
      <form
        onSubmit={(event) => event.preventDefault()}
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
                    disabled
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
                    disabled
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
                  disabled
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
                  <Input placeholder="Digite a cidade" disabled {...field} />
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
                  disabled
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
            type="button"
            className="flex-1"
            onClick={() => router.push(`/users/${userId}/edit`)}
          >
            Editar <ArrowRight className="size-4" />
          </Button>
        </div>
      </form>
    </Form>
  )
}
