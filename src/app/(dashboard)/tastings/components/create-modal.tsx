'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { createTastingAction } from '@promo/actions/create-tasting'
import { Collections } from '@promo/collections'
import {
  MultipleSelectorWithQuantity,
  type MultipleSelectorWithQuantityRef,
} from '@promo/components/multi-select-with-quantity'
import { Button } from '@promo/components/ui/button'
import { Combobox } from '@promo/components/ui/combobox'
import { DatePicker } from '@promo/components/ui/date-picker-rac'
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
import { UserSituationEnum } from '@promo/enum/user-situation'
import { firestore } from '@promo/lib/firebase/client'
import { CompanyStatusEnum } from '@promo/types/models/company'
import {
  buildSeparator,
  buildValueForCombobox,
} from '@promo/utils/build-value-for-combobox'
import { capitalizeTextSplit } from '@promo/utils/format-string-to-show'
import { EMPTY_STRING } from '@promo/utils/generates-substrings-to-query-search'
import { normalizeText } from '@promo/utils/normalize-text'
import { and, collection, getDocs, query, where } from 'firebase/firestore'
import { Loader, Plus } from 'lucide-react'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useServerAction } from 'zsa-react'

const schema = z
  .object({
    promoter: z.string({
      required_error: 'Promotor é obrigatório',
    }),
    startDate: z.coerce.date({
      required_error: 'Data de início é obrigatória',
    }),
    endDate: z.coerce.date({
      required_error: 'Data de término é obrigatória',
    }),
    city: z
      .string({
        required_error: 'Cidade é obrigatória',
      })
      .min(1, {
        message: 'Cidade é obrigatória',
      }),
    company: z.string({
      required_error: 'Empresa é obrigatória',
    }),
    products: z.array(
      z.string({
        required_error: 'Produtos são obrigatórios',
      }),
    ),
    notes: z.string().optional(),
  })
  .refine((data) => data.startDate < data.endDate, {
    message: 'Data de início deve ser anterior à data de término',
    path: ['endDate'],
  })
  .refine(
    (data) => {
      if (!data.notes || data.notes.length === 0) {
        return true
      }

      return data.notes.length <= 200
    },
    {
      message: 'Notas devem ter no máximo 200 caracteres',
      path: ['notes'],
    },
  )

type Schema = z.infer<typeof schema>

export function CreateTastingModal() {
  const [isOpen, setIsOpen] = useState(false)
  const { execute } = useServerAction(createTastingAction)

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      promoter: '',
      startDate: new Date(),
      endDate: new Date(),
      city: '',
      company: '',
      products: [],
      notes: '',
    },
  })

  const multipleSelectorWithQuantityRef =
    useRef<MultipleSelectorWithQuantityRef>(null)

  async function fetchPromoters(_query: string = '') {
    const coll = collection(firestore, Collections.USERS)
    const q = query(
      coll,
      and(
        where('searchQuery', 'array-contains-any', [
          normalizeText(_query) || EMPTY_STRING,
        ]),
        where('roleId', '==', '3UW2Xcq1kv5ZYF2ZO6cl'),
        where('situation', '==', UserSituationEnum.ACTIVE),
      ),
    )

    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => {
      const data = doc.data()

      return {
        value: buildValueForCombobox({
          value: doc.id,
          label: data.name,
        }),
        label: data.name,
        raw: {
          id: doc.id,
          ...data,
        },
      }
    })
  }

  async function fetchCompanies(_query: string = '') {
    const coll = collection(firestore, Collections.COMPANIES)
    const q = query(
      coll,
      and(
        where('searchQuery', 'array-contains-any', [
          normalizeText(_query) || EMPTY_STRING,
        ]),
        where('status', '==', CompanyStatusEnum.ACTIVE),
      ),
    )

    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => {
      const data = doc.data()

      return {
        value: buildValueForCombobox({
          value: doc.id,
          label: data.name,
        }),
        label: data.name,
        raw: {
          id: doc.id,
          ...data,
        },
      }
    })
  }

  async function fetchProducts(_query: string = '') {
    const coll = collection(firestore, Collections.PRODUCTS)
    const q = query(
      coll,
      and(
        where('searchQuery', 'array-contains-any', [
          normalizeText(_query) || EMPTY_STRING,
        ]),
        where('status', '==', CompanyStatusEnum.ACTIVE),
      ),
    )

    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => {
      const data = doc.data()

      return {
        value: buildValueForCombobox({
          value: doc.id,
          label: data.name,
        }),
        label: data.name,
      }
    })
  }

  async function handleRegisterTasting({
    promoter,
    startDate,
    endDate,
    city,
    company,
    notes,
  }: Schema) {
    const [result, resultError] = await execute({
      promoter,
      startDate,
      endDate,
      city,
      company,
      products: multipleSelectorWithQuantityRef.current?.selectedValue || [],
      notes,
    })

    if (resultError) {
      toast.error('Erro ao cadastrar degustação', {
        description: resultError.message || 'Tente novamente mais tarde',
      })
      return
    }

    if (result.success) {
      toast.success(result?.message || 'Degustação cadastrada com sucesso')
      form.reset({
        promoter: '',
        startDate: new Date(),
        endDate: new Date(),
        city: '',
        company: '',
        products: [],
        notes: '',
      })

      setIsOpen(false)
      return
    }

    toast.error('Erro ao cadastrar degustação', {
      description: result?.message || 'Tente novamente mais tarde',
    })
  }

  return (
    <Modal
      title="Registrar nova degustação"
      description="Preencha as informações para registrar uma nova degustação"
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <Button className="w-full @lg:w-auto" variant="default">
          <Plus className="size-4" />
          Nova Degustação
        </Button>
      }
      extraFooterContent={
        <Button
          isLoading={form.formState.isSubmitting}
          type="submit"
          form="tasting-creation-form"
        >
          Registrar Degustação
        </Button>
      }
    >
      <Form {...form}>
        <form
          className="space-y-4"
          id="tasting-creation-form"
          onSubmit={form.handleSubmit(handleRegisterTasting)}
        >
          <FormField
            control={form.control}
            name="promoter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Promotor</FormLabel>
                <FormControl>
                  <Combobox
                    queryFn={fetchPromoters}
                    value={field.value}
                    onChange={(promoterId: string) => {
                      field.onChange(promoterId)
                      // if (raw) {
                      //   form.setValue('city', raw.city)
                      //   form.clearErrors('city')
                      // } else {
                      //   form.resetField('city', {
                      //     defaultValue: '',
                      //   })

                      //   form.setError('city', {
                      //     message: 'Cidade é obrigatória',
                      //   })
                      // }
                    }}
                    placeholder="Selecione um promotor"
                    toasts={{
                      loadingError: 'Erro ao buscar promotores(as)',
                    }}
                    loadingText="Buscando promotores(as)..."
                    entity="promoter"
                  />
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
                  <Input placeholder="Cidade" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem className="">
                <FormLabel>Empresa</FormLabel>
                <FormControl>
                  <Combobox
                    queryFn={fetchCompanies}
                    value={field.value}
                    onChange={(companyId: string) => {
                      field.onChange(companyId)
                    }}
                    placeholder="Selecione uma empresa"
                    toasts={{
                      loadingError: 'Erro ao buscar empresas',
                    }}
                    loadingText="Buscando empresas..."
                    entity="company"
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="products"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Produtos</FormLabel>
                <FormControl>
                  <MultipleSelectorWithQuantity
                    ref={multipleSelectorWithQuantityRef}
                    commandProps={{
                      label: 'Selecione os produtos',
                    }}
                    emptyIndicator={
                      <p className="text-center text-sm">
                        Nenhum produto encontrado
                      </p>
                    }
                    loadingIndicator={
                      <div className="flex items-center w-full justify-center py-12 gap-2">
                        <Loader className="animate-spin size-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Buscando produtos...
                        </span>
                      </div>
                    }
                    value={field.value?.map((v) => ({
                      value: v,
                      label: capitalizeTextSplit(
                        v.split(buildSeparator)[0] || '',
                      ),
                    }))}
                    triggerSearchOnFocus
                    placeholder="Selecione os produtos"
                    onSearch={fetchProducts}
                    onChange={(value) => {
                      field.onChange(value.map((v) => v.value))
                    }}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de início</FormLabel>

                <FormControl>
                  <DatePicker
                    value={field.value}
                    onChange={(date) => {
                      field.onChange(date)
                    }}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de término</FormLabel>

                <FormControl>
                  <DatePicker
                    value={field.value}
                    onChange={(date) => {
                      field.onChange(date)
                    }}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Observações (Opcional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g. 'Promotor deve ser mais atencioso com o cliente'"
                    {...field}
                    maxLength={200}
                    rows={4}
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
