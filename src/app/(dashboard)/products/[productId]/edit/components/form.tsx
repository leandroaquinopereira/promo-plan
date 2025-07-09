'use client'

import { useRouter } from '@bprogress/next'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Company, Product } from '@promo/@types/firebase'
import { updateCompanyAction } from '@promo/actions/update-company'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@promo/components/ui/select'
import { Textarea } from '@promo/components/ui/textarea'
import { FirebaseErrorCode } from '@promo/constants/firebase-error-code'
import { CompanyStatusEnum } from '@promo/enum/company-status'
import { ProductStatusEnum } from '@promo/enum/product-status'
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
  status: z.enum([ProductStatusEnum.ACTIVE, ProductStatusEnum.INACTIVE], {
    required_error: 'Status é obrigatório',
    // errorMap: () => ({ message: 'Status é obrigatório' }),
  }),
  description: z
    .string()
    .transform((description) => description || '')
    .refine((description) => description.length >= 3, {
      message: 'Descrição deve ter pelo menos 3 caracteres',
    })
    .refine((description) => description.length <= 200, {
      message: 'Descrição deve ter no máximo 200 caracteres',
    }),
})

type Schema = z.infer<typeof schema>

type EditProductFormProps = {
  product: Product
}

export function EditProductForm({ product }: EditProductFormProps) {
  const { execute } = useServerAction(updateProductAction)

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: product.name,
      description: product.description,
      status: product.status as any,
    },
  })

  const router = useRouter()

  async function handleEditProduct({ name, description, status }: Schema) {
    const [result, resultError] = await execute({
      description,
      name,
      status,
      id: product.id,
    })

    if (resultError) {
      toast.error('Erro ao editar produto', {
        description: resultError.message || 'Tente novamente mais tarde',
      })
      return
    }

    if (!result?.success) {
      let message = 'Erro ao editar produto'
      if (result?.error?.code === FirebaseErrorCode.OBJECT_NOT_FOUND) {
        message = 'Produto não encontrado'
      }

      toast.error('Erro ao editar produto', {
        description: message,
      })
      return
    }

    toast.success('Produto editado com sucesso')
    form.reset()

    router.push('/products')
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleEditProduct)}
        className="grid grid-cols-2 gap-2"
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
                  placeholder="Nome da empresa"
                  className="w-full"
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={field.disabled}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value={CompanyStatusEnum.ACTIVE}>
                      Ativo
                    </SelectItem>
                    <SelectItem value={CompanyStatusEnum.INACTIVE}>
                      Inativo
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Descrição do produto"
                  className="w-full h-72"
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <div className="gap-2 mt-4 grid grid-cols-2 col-span-2">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Voltar
          </Button>

          <Button type="submit" isLoading={form.formState.isSubmitting}>
            Salvar
          </Button>
        </div>
      </form>
    </Form>
  )
}
