'use client'

import { useRouter } from '@bprogress/next'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Tasting } from '@promo/types/firebase'
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
import { CompanyStatusEnum } from '@promo/enum/company-status'
import { firestore } from '@promo/lib/firebase/client'
import {
  buildSeparator,
  buildValueForCombobox,
} from '@promo/utils/build-value-for-combobox'
import { convertFirebaseDateForForm } from '@promo/utils/date-helpers'
import { capitalizeTextSplit } from '@promo/utils/format-string-to-show'
import { EMPTY_STRING } from '@promo/utils/generates-substrings-to-query-search'
import { normalizeText } from '@promo/utils/normalize-text'
import { and, collection, doc, getDocs, query, where } from 'firebase/firestore'
import { ArrowRight, Loader } from 'lucide-react'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

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

type DetailTastingFormProps = {
  tasting: Tasting
}

export function DetailTastingForm({ tasting }: DetailTastingFormProps) {
  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    disabled: true,
    defaultValues: {
      promoter: tasting.promoter.id,
      company: tasting.company.id,
      products: tasting.products.map((product) =>
        buildValueForCombobox({
          value: product.id,
          label: product.name,
        }),
      ),
      startDate: convertFirebaseDateForForm(tasting.startDate),
      endDate: convertFirebaseDateForForm(tasting.endDate),
      city: tasting.promoter.city,
      notes: tasting.notes || '',
    },
  })

  const router = useRouter()

  const fetchPromoters = useCallback(async function fetchPromoters(
    _query: string = '',
  ) {
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
          name: data.name,
          city: data.city,
          phone: data.phone,
          email: data.email,
        },
      }
    })
  }, [])

  const fetchCompanies = useCallback(async function fetchCompanies(
    _query: string = '',
  ) {
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
          name: data.name,
          status: data.status,
        },
      }
    })
  }, [])

  const fetchProducts = useCallback(async function fetchProducts(
    _query: string = '',
  ) {
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
  }, [])

  return (
    <Form {...form}>
      <form
        onSubmit={(event) => event.preventDefault()}
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
                    disabled
                    queryFn={fetchPromoters}
                    value={field.value}
                    onChange={(promoterId: string, raw?: any) => {
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
                    disabled
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
                    disabled
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
                    disabled
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
                    disabled
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Voltar
          </Button>

          <Button
            type="button"
            onClick={() => router.push(`/tastings/${tasting.id}/edit`)}
          >
            Editar
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </form>
    </Form>
  )
}
