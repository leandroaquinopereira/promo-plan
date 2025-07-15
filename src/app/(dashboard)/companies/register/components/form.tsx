'use client'

import { useRouter } from '@bprogress/next'
import { zodResolver } from '@hookform/resolvers/zod'
import { createCompanyAction } from '@promo/actions/create-company'
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
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useServerAction } from 'zsa-react'

const schema = z.object({
  name: z
    .string({
      required_error: 'Nome é obrigatório',
    })
    .min(1, { message: 'Nome é obrigatório' })
    .transform((name) => name.trim())
    .refine((name) => name.length >= 3, {
      message: 'Nome deve ter pelo menos 3 caracteres',
    }),
})

type Schema = z.infer<typeof schema>

type RegisterCompanyFormProps = {
  onSubmit?: () => void
}

export function RegisterCompanyForm({ onSubmit }: RegisterCompanyFormProps) {
  const { execute } = useServerAction(createCompanyAction)

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
  })

  const router = useRouter()

  async function handleRegisterCompany({ name }: Schema) {
    const [result, resultError] = await execute({
      name,
    })

    if (resultError) {
      toast.error('Erro ao cadastrar empresa', {
        description: resultError.message || 'Tente novamente mais tarde',
      })
      return
    }

    if (!result?.success) {
      toast.error('Erro ao cadastrar empresa', {
        description: result?.error?.message || 'Tente novamente mais tarde',
      })
      return
    }

    toast.success('Empresa cadastrada com sucesso')
    form.reset()

    onSubmit?.()

    router.push('/companies')
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleRegisterCompany)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Nome da empresa"
                  className="w-full"
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full mt-4"
          isLoading={form.formState.isSubmitting}
        >
          Cadastrar
        </Button>
      </form>
    </Form>
  )
}
