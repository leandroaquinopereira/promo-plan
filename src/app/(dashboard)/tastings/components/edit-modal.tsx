'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { updateProductAction } from '@promo/actions/update-product'
import { updateTastingAction } from '@promo/actions/update-tasting'
import { Collections } from '@promo/collections'
import {
  MultipleSelectorWithQuantity,
  MultipleSelectorWithQuantityRef,
} from '@promo/components/multi-select-with-quantity'
import { Button } from '@promo/components/ui/button'
import { Combobox } from '@promo/components/ui/combobox'
import { ShadcnUIDatePicker } from '@promo/components/ui/datepicker'
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
import { CompanyStatusEnum } from '@promo/enum/company-status'
import { ProductStatusEnum } from '@promo/enum/product-status'
import { UserSituationEnum } from '@promo/enum/user-situation'
import { firestore } from '@promo/lib/firebase/client'
import type { Product, Tasting } from '@promo/types/firebase'
import {
  buildSeparator,
  buildValueForCombobox,
} from '@promo/utils/build-value-for-combobox'
import { capitalizeTextSplit } from '@promo/utils/format-string-to-show'
import { EMPTY_STRING } from '@promo/utils/generates-substrings-to-query-search'
import { normalizeText } from '@promo/utils/normalize-text'
import { and, collection, getDocs, query, where } from 'firebase/firestore'
import { Loader } from 'lucide-react'
import { type RefObject, useImperativeHandle, useRef, useState } from 'react'
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

export type EditTastingModalRef = {
  open: (product: Tasting, isReadOnly: boolean) => void
}

type EditTastingModalProps = {
  ref: RefObject<EditTastingModalRef | null>
}

export function EditTastingModal({ ref }: EditTastingModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tasting, setTasting] = useState<Tasting | null>(null)

  const [isReadOnly, setIsReadOnly] = useState(false)
  const { execute } = useServerAction(updateTastingAction)
  const multipleSelectorWithQuantityRef =
    useRef<MultipleSelectorWithQuantityRef>(null)

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      promoter: '',
      city: '',
      company: '',
      products: [],
      notes: '',
    },
  })

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
        where('status', '==', ProductStatusEnum.ACTIVE),
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

  async function handleUpdateTasting({ company, promoter, notes }: Schema) {
    if (!tasting) {
      toast.error('Degustação não encontrada', {
        description: 'Tente novamente mais tarde',
      })
      return
    }
    const [result, resultError] = await execute({
      ...tasting,
      company,
      promoter,
      notes,
      products: multipleSelectorWithQuantityRef.current?.selectedValue || [],
    })
    if (resultError) {
      toast.error('Erro ao atualizar degustação', {
        description: resultError.message || 'Tente novamente mais tarde',
      })
      return
    }
    if (result.success) {
      toast.success('Degustação atualizada com sucesso')
      form.reset({
        promoter: '',
        city: '',
        company: '',
        products: [],
        notes: '',
        endDate: new Date(),
        startDate: new Date(),
      })
      setIsOpen(false)
      return
    }
    toast.error('Erro ao atualizar degustação', {
      description: result.message || 'Tente novamente mais tarde',
    })
  }

  useImperativeHandle(ref, () => ({
    open: (tasting: Tasting, isReadOnly: boolean) => {
      setTasting(tasting)
      setIsReadOnly(isReadOnly)
      setIsOpen(true)

      form.reset({
        city: tasting.city,
        company: buildValueForCombobox({
          label: tasting.company.name,
          value: tasting.company.id,
        }),
        endDate: new Date(tasting.endDate),
        notes: tasting.notes,
        promoter: buildValueForCombobox({
          label: tasting.promoter.name,
          value: tasting.promoter.id,
        }),
        products: tasting.products
          ? tasting.products.map((product) => {
              return buildValueForCombobox({
                label: product.name,
                value: product.id,
              })
            })
          : [],
        startDate: new Date(tasting.startDate),
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
          onSubmit={form.handleSubmit(handleUpdateTasting)}
        >
          <FormField
            control={form.control}
            name="promoter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Promotor</FormLabel>
                <FormControl>
                  <Combobox
                    disabled={isReadOnly}
                    queryFn={fetchPromoters}
                    value={field.value}
                    onChange={(promoterId: string) => {
                      field.onChange(promoterId)
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
                  <Input
                    placeholder="Cidade"
                    {...field}
                    disabled={isReadOnly}
                  />
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
                    disabled={isReadOnly}
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
                    disabled={isReadOnly}
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
                    value={field.value?.map((v, index) => {
                      const quantity = tasting?.products?.[index]?.quantity || 0
                      return {
                        value: v,
                        label: capitalizeTextSplit(
                          v.split(buildSeparator)[0] || '',
                        ),
                        quantity,
                      }
                    })}
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
                  <ShadcnUIDatePicker
                    disabled
                    selected={field.value}
                    onSelect={(date) => {
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
                  <ShadcnUIDatePicker
                    disabled
                    selected={field.value}
                    onSelect={(date) => {
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
                    disabled={isReadOnly}
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
