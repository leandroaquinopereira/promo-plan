'use client'

import { useRouter } from '@bprogress/next'
import { zodResolver } from '@hookform/resolvers/zod'
import { createProductAction } from '@promo/actions/create-product'
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
import { Textarea } from '@promo/components/ui/textarea'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useServerAction } from 'zsa-react'

const schema = z.object({
  name: z
    .string({
      required_error: 'Nome é obrigatório',
    })
    .min(1, { message: 'Nome é obrigatório' }),
  description: z
    .string({
      required_error: 'Descrição é obrigatória',
    })
    .transform((description) => description || '')
    .refine((description) => description.length >= 3, {
      message: 'Descrição deve ter pelo menos 3 caracteres',
    })
    .refine((description) => description.length <= 200, {
      message: 'Descrição deve ter no máximo 200 caracteres',
    }),
})

type Schema = z.infer<typeof schema>

export function RegisterProductForm() {
  const { execute } = useServerAction(createProductAction)
  const form = useForm<Schema>({
    resolver: zodResolver(schema),
  })

  const router = useRouter()

  async function handleCreateProduct({ name, description = '' }: Schema) {
    const [result, resultError] = await execute({ name, description })

    if (resultError || !result?.success) {
      toast.error('Erro ao cadastrar produto', {
        description: resultError?.message || 'Erro ao cadastrar produto',
      })

      return
    }

    toast.success('Produto cadastrado com sucesso')
    form.reset()

    router.push('/products')
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleCreateProduct)}
        className="space-y-4"
      >
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do produto" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Textarea
                    className="h-72"
                    placeholder="Descrição do produto"
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          isLoading={form.formState.isSubmitting}
        >
          Cadastrar
        </Button>
      </form>
    </Form>
  )
}
