'use client'

import { useRouter } from '@bprogress/next'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Company } from '@promo/@types/firebase'
import { updateCompanyAction } from '@promo/actions/update-company'
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
import { FirebaseErrorCode } from '@promo/constants/firebase-error-code'
import { CompanyStatusEnum } from '@promo/enum/company-status'
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

  status: z.enum([CompanyStatusEnum.ACTIVE, CompanyStatusEnum.INACTIVE], {
    required_error: 'Status é obrigatório',
    // errorMap: () => ({ message: 'Status é obrigatório' }),
  }),
})

type Schema = z.infer<typeof schema>

type EditCompanyFormProps = {
  company: Company
}

export function EditCompanyForm({ company }: EditCompanyFormProps) {
  const { execute } = useServerAction(updateCompanyAction)

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: company.name,
      status: company.status as CompanyStatusEnum,
    },
  })

  const router = useRouter()

  async function handleEditCompany({ name, status }: Schema) {
    const [result, resultError] = await execute({
      id: company.id,
      name,
      status,
    })

    if (resultError) {
      toast.error('Erro ao editar empresa', {
        description: resultError.message || 'Tente novamente mais tarde',
      })
      return
    }

    if (!result?.success) {
      let message = 'Erro ao editar empresa'
      if (result?.error?.code === FirebaseErrorCode.OBJECT_NOT_FOUND) {
        message = 'Empresa não encontrada'
      }

      toast.error('Erro ao editar empresa', {
        description: message,
      })
      return
    }

    toast.success('Empresa editada com sucesso')
    form.reset()

    router.push('/companies')
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleEditCompany)}
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
