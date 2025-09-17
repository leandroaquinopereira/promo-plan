'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { createCompanyAction } from '@promo/actions/create-company'
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
import { Modal } from '@promo/components/ui/modal'
import { Textarea } from '@promo/components/ui/textarea'
import { Plus } from 'lucide-react'
import { useState } from 'react'
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

export function CreateProductModal() {
  const [isOpen, setIsOpen] = useState(false)
  const { execute } = useServerAction(createProductAction)

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
    },
  })

  async function handleRegisterProduct({ name, description }: Schema) {
    const [result, resultError] = await execute({
      name,
      description,
    })

    if (resultError) {
      toast.error('Erro ao cadastrar produto', {
        description: resultError.message || 'Tente novamente mais tarde',
      })
      return
    }

    if (result.success) {
      toast.success(result.message)
      form.reset({
        name: '',
        description: '',
      })

      setIsOpen(false)
      return
    }

    toast.error('Erro ao cadastrar produto', {
      description: result.message || 'Tente novamente mais tarde',
    })
  }

  return (
    <Modal
      title="Registrar novo produto"
      description="Preencha as informações para registrar um novo produto"
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <Button className="w-full @lg:w-auto" variant="default">
          <Plus className="size-4" />
          Novo Produto
        </Button>
      }
      extraFooterContent={
        <Button
          isLoading={form.formState.isSubmitting}
          type="submit"
          form="product-creation-form"
        >
          Registrar Produto
        </Button>
      }
    >
      <Form {...form}>
        <form
          className="space-y-4"
          id="product-creation-form"
          onSubmit={form.handleSubmit(handleRegisterProduct)}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Produto</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Nome do produto"
                    disabled={form.formState.isSubmitting}
                  />
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
                <FormLabel>Descrição do Produto</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    disabled={form.formState.isSubmitting}
                    className="min-h-40"
                    placeholder="Coloque aqui a descrição do produto"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </Modal>
  )
}
