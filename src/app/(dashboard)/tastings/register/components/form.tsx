'use client'

import { useRouter } from '@bprogress/next'
import { zodResolver } from '@hookform/resolvers/zod'
import { createTastingAction } from '@promo/actions/create-tasting'
import { Collections } from '@promo/collections'
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
import MultipleSelector from '@promo/components/ui/multiselect'
import { Textarea } from '@promo/components/ui/textarea'
import { FirebaseErrorCode } from '@promo/constants/firebase-error-code'
import { CompanyStatusEnum } from '@promo/enum/company-status'
import { firestore } from '@promo/lib/firebase/client'
import {
  buildSeparator,
  buildValueForCombobox,
} from '@promo/utils/build-value-for-combobox'
import { capitalizeTextSplit } from '@promo/utils/format-string-to-show'
import { EMPTY_STRING } from '@promo/utils/generates-substrings-to-query-search'
import { normalizeText } from '@promo/utils/normalize-text'
import { and, collection, doc, getDocs, query, where } from 'firebase/firestore'
import { Loader } from 'lucide-react'
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

export function RegisterTastingForm() {
  const { execute } = useServerAction(createTastingAction)

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
  })

  const router = useRouter()

  async function fetchPromoters(_query: string = '') {
    const coll = collection(firestore, Collections.USERS)
    const q = query(
      coll,
      and(
        where('searchQuery', 'array-contains-any', [
          normalizeText(_query) || EMPTY_STRING,
        ]),
        where(
          'role',
          '==',
          doc(firestore, Collections.ROLES, '3UW2Xcq1kv5ZYF2ZO6cl'),
        ),
        where('situation', '==', 'active'),
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
    company,
    products,
    startDate,
    endDate,
    notes,
    promoter,
  }: Schema) {
    try {
      const [result, resultError] = await execute({
        company,
        products,
        startDate,
        endDate,
        notes,
        promoter,
      })

      if (resultError) {
        toast.error('Erro ao registrar tentação', {
          description: resultError.message,
        })

        return
      }

      if (!result.success) {
        let message = 'Erro ao registrar tentação'

        if (result.error?.code === FirebaseErrorCode.OBJECT_NOT_FOUND) {
          message = 'Promotor, empresa ou produtos não encontrados'
        }

        toast.error('Erro ao registrar tentação', {
          description: message,
        })

        return
      }

      toast.success('Tentação registrada com sucesso')
      router.push(`/tastings`)
    } catch (error) {
      toast.error('Erro ao registrar tentação', {
        description:
          error instanceof Error ? error.message : 'Erro desconhecido',
      })
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleRegisterTasting)}
        className="space-y-4 @container"
      >
        <div className="grid grid-cols-1 @md:grid-cols-2 gap-4 w-full place-content-start">
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
                    onChange={(promoterId: string, raw?: any) => {
                      console.log(raw, promoterId)

                      field.onChange(promoterId)
                      if (raw) {
                        form.setValue('city', raw.city)
                        form.clearErrors('city')
                      } else {
                        form.resetField('city', {
                          defaultValue: '',
                        })

                        form.setError('city', {
                          message: 'Cidade é obrigatória',
                        })
                      }
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
            disabled
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
                  <MultipleSelector
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
        </div>

        <Button
          type="submit"
          className="w-full"
          isLoading={form.formState.isLoading}
        >
          Registrar
        </Button>
      </form>
    </Form>
  )
}
