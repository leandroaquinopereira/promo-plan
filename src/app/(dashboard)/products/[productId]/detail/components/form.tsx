'use client'

import { useRouter } from '@bprogress/next'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Product } from '@promo/types/firebase'
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
import { ProductStatusEnum } from '@promo/enum/product-status'
import { ArrowRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

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
  description: z.string().optional(),
})

type Schema = z.infer<typeof schema>

type DetailProductFormProps = {
  product: Product
}

export function DetailProductForm({ product }: DetailProductFormProps) {
  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: product.name,
      description: product.description,
      status: product.status as any,
    },
    disabled: true,
  })

  const router = useRouter()

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(() => {})}
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
                    <SelectItem value={ProductStatusEnum.ACTIVE}>
                      Ativo
                    </SelectItem>
                    <SelectItem value={ProductStatusEnum.INACTIVE}>
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

        <div className="gap-2 mt-4 col-span-2 grid grid-cols-2">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Voltar
          </Button>

          <Button
            type="button"
            onClick={() => router.push(`/products/${product.id}/edit`)}
          >
            Editar
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </form>
    </Form>
  )
}
