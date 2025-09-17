'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { createCompanyAction } from '@promo/actions/create-company'
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
import { Modal } from '@promo/components/ui/modal'
import { CompanyStatusEnum } from '@promo/enum/company-status'
import type { Company } from '@promo/types/firebase'
import { Plus } from 'lucide-react'
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
    .min(1, { message: 'Nome é obrigatório' })
    .transform((name) => name.trim())
    .refine((name) => name.length >= 3, {
      message: 'Nome deve ter pelo menos 3 caracteres',
    }),
})

type Schema = z.infer<typeof schema>

export type EditCompanyModalRefs = {
  open: (company: Company, isReadOnly: boolean) => void
}

type EditCompanyModalProps = {
  ref: RefObject<EditCompanyModalRefs | null>
}

export function EditCompanyModal({ ref }: EditCompanyModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [company, setCompany] = useState<Company | null>(null)

  const [isReadOnly, setIsReadOnly] = useState(false)
  const { execute } = useServerAction(updateCompanyAction)

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
    },
  })

  async function handleUpdateCompany({ name }: Schema) {
    if (!company) {
      toast.error('Empresa não encontrada', {
        description: 'Tente novamente mais tarde',
      })

      return
    }

    const [result, resultError] = await execute({
      ...company,
      name,
    })

    if (resultError) {
      toast.error('Erro ao atualizar empresa', {
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

    toast.error('Erro ao atualizar empresa', {
      description: result.message || 'Tente novamente mais tarde',
    })
  }

  useImperativeHandle(ref, () => ({
    open: (company: Company, isReadOnly: boolean) => {
      setCompany(company)
      setIsReadOnly(isReadOnly)
      setIsOpen(true)

      form.reset({
        name: company.name,
      })
    },
  }))

  return (
    <Modal
      title={isReadOnly ? 'Visualizar Empresa' : 'Editar Empresa'}
      description={
        isReadOnly
          ? 'Visualize os dados da empresa'
          : 'Insira um nome para a empresa'
      }
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      extraFooterContent={
        !isReadOnly && (
          <Button
            isLoading={form.formState.isSubmitting}
            type="submit"
            form="company-creation-form"
          >
            Salvar
          </Button>
        )
      }
    >
      <Form {...form}>
        <form
          className="space-y-4"
          id="company-creation-form"
          onSubmit={form.handleSubmit(handleUpdateCompany)}
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
                    placeholder="Digite o nome da empresa"
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
