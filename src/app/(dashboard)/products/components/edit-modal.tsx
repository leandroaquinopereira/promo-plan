'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { updateProductAction } from '@promo/actions/update-product'
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
import type { Product } from '@promo/types/firebase'
import { type RefObject, useImperativeHandle, useState } from 'react'
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

export type EditProductModalRefs = {
  open: (product: Product, isReadOnly: boolean) => void
}

type EditProductModalProps = {
  ref: RefObject<EditProductModalRefs | null>
}

export function EditProductModal({ ref }: EditProductModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)

  const [isReadOnly, setIsReadOnly] = useState(false)
  const { execute } = useServerAction(updateProductAction)

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
    },
  })

  async function handleUpdateProduct({ name, description }: Schema) {
    if (!product) {
      toast.error('Produto não encontrado', {
        description: 'Tente novamente mais tarde',
      })

      return
    }

    const [result, resultError] = await execute({
      ...product,
      name,
      description,
    })

    if (resultError) {
      toast.error('Erro ao atualizar produto', {
        description: resultError.message || 'Tente novamente mais tarde',
      })
      return
    }

    if (result.success) {
      toast.success('Produto atualizado com sucesso')
      form.reset({
        name: '',
      })

      setIsOpen(false)
      return
    }

    toast.error('Erro ao atualizar produto', {
      description: result.message || 'Tente novamente mais tarde',
    })
  }

  useImperativeHandle(ref, () => ({
    open: (product: Product, isReadOnly: boolean) => {
      setProduct(product)
      setIsReadOnly(isReadOnly)
      setIsOpen(true)

      form.reset({
        name: product.name,
        description: product.description,
      })
    },
  }))

  return (
    <Modal
      title={isReadOnly ? 'Visualizar Produto' : 'Editar Produto'}
      description={
        isReadOnly
          ? 'Visualize os dados do produto'
          : 'Insira um nome para o produto'
      }
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      extraFooterContent={
        !isReadOnly && (
          <Button
            isLoading={form.formState.isSubmitting}
            type="submit"
            form="product-creation-form"
          >
            Salvar
          </Button>
        )
      }
    >
      <Form {...form}>
        <form
          className="space-y-4"
          id="product-creation-form"
          onSubmit={form.handleSubmit(handleUpdateProduct)}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isReadOnly || form.formState.isSubmitting}
                    placeholder="Nome do produto"
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
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    disabled={isReadOnly || form.formState.isSubmitting}
                    placeholder="Coloque aqui a descrição do produto"
                    className="min-h-40"
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
