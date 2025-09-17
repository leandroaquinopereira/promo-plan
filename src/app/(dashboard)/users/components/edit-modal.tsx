'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { updateUserAction } from '@promo/actions/update-user'
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
import { Modal } from '@promo/components/ui/modal'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@promo/components/ui/select'
import { brazilianStates } from '@promo/constants/brazilian-states'
import type { User } from '@promo/types/firebase'
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
  permission: z.string({
    required_error: 'Permissão é obrigatória',
  }),
})

type Schema = z.infer<typeof schema>

export type EditUserModalRefs = {
  open: (user: User, isReadOnly: boolean) => void
}

type EditUserModalProps = {
  ref: RefObject<EditUserModalRefs | null>
}

export function EditUserModal({ ref }: EditUserModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  const [isReadOnly, setIsReadOnly] = useState(false)
  const { execute } = useServerAction(updateUserAction)

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      phone: '',
      state: '',
      city: '',
      permission: '',
    },
  })

  async function handleUpdateUser(data: Schema) {
    if (!user) {
      toast.error('Usuário não encontrado', {
        description: 'Tente novamente mais tarde',
      })

      return
    }

    const [result, resultError] = await execute({
      ...user,
      ...data,
      userId: user.id,
      permission: user.role.id,
    })

    if (resultError) {
      toast.error('Erro ao atualizar usuário', {
        description: resultError.message || 'Tente novamente mais tarde',
      })
      return
    }

    if (result.success) {
      toast.success(result.message)
      form.reset({
        name: '',
        phone: '',
        state: '',
        city: '',
        permission: '',
      })

      setIsOpen(false)
      return
    }

    toast.error('Erro ao atualizar usuário', {
      description: result.message || 'Tente novamente mais tarde',
    })
  }

  useImperativeHandle(ref, () => ({
    open: (user: User, isReadOnly: boolean) => {
      setUser(user)
      setIsReadOnly(isReadOnly)
      setIsOpen(true)

      form.reset({
        name: user.name,
        phone: user.phone,
        state: user.state,
        city: user.city,
        permission: user.role.id,
      })
    },
  }))

  return (
    <Modal
      title={isReadOnly ? 'Visualizar Usuário' : 'Editar Usuário'}
      description={
        isReadOnly
          ? 'Visualize os dados do usuário'
          : 'Insira um nome para o usuário'
      }
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      extraFooterContent={
        !isReadOnly && (
          <Button
            isLoading={form.formState.isSubmitting}
            type="submit"
            form="user-creation-form"
          >
            Salvar
          </Button>
        )
      }
    >
      <Form {...form}>
        <form
          className="space-y-4"
          id="user-creation-form"
          onSubmit={form.handleSubmit(handleUpdateUser)}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Usuário</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Digite o nome do usuário"
                    disabled={isReadOnly || form.formState.isSubmitting}
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
                    {...field}
                    placeholder="(XX) XXXXX-XXXX"
                    disabled={isReadOnly || form.formState.isSubmitting}
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
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isReadOnly || form.formState.isSubmitting}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {brazilianStates.map((state) => (
                        <SelectItem key={state.value} value={state.value}>
                          {state.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
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
                  <Input
                    {...field}
                    placeholder="Digite a cidade"
                    disabled={isReadOnly || form.formState.isSubmitting}
                  />
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
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isReadOnly || form.formState.isSubmitting}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione a permissão" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3UW2Xcq1kv5ZYF2ZO6cl">
                        Freelancer (Operacional)
                      </SelectItem>
                      <SelectItem value="WlHvVUKhT7jNgslshkbH">
                        Admin
                      </SelectItem>
                    </SelectContent>
                  </Select>
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
