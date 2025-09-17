'use client'

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
import { Modal } from '@promo/components/ui/modal'
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
    .min(1, { message: 'Nome é obrigatório' })
    .transform((name) => name.trim())
    .refine((name) => name.length >= 3, {
      message: 'Nome deve ter pelo menos 3 caracteres',
    }),
})

type Schema = z.infer<typeof schema>

export function CreateCompanyModal() {
  const [isOpen, setIsOpen] = useState(false)
  const { execute } = useServerAction(createCompanyAction)

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
    },
  })

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

    if (result.success) {
      toast.success(result.message)
      form.reset({
        name: '',
      })

      setIsOpen(false)
      return
    }

    toast.error('Erro ao cadastrar empresa', {
      description: result.message || 'Tente novamente mais tarde',
    })
  }

  return (
    <Modal
      title="Registrar nova empresa"
      description="Preencha as informações para registrar uma nova empresa"
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <Button className="w-full @lg:w-auto" variant="default">
          <Plus className="size-4" />
          Nova Empresa
        </Button>
      }
      extraFooterContent={
        <Button
          isLoading={form.formState.isSubmitting}
          type="submit"
          form="company-creation-form"
        >
          Registrar Empresa
        </Button>
      }
    >
      <Form {...form}>
        <form
          className="space-y-4"
          id="company-creation-form"
          onSubmit={form.handleSubmit(handleRegisterCompany)}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da Empresa</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Digite o nome da empresa"
                    disabled={form.formState.isSubmitting}
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
