'use client'

import { useDebouncedCallback } from '@mantine/hooks'
import { Collections } from '@promo/collections'
import { MotionDiv } from '@promo/components/framer-motion/motion-div'
import { Button } from '@promo/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@promo/components/ui/card'
import { Combobox } from '@promo/components/ui/combobox'
import { Input } from '@promo/components/ui/input'
import { Label } from '@promo/components/ui/label'
import { NumberInput } from '@promo/components/ui/number-input'
import {
  type DateRange,
  RangeDatePicker,
} from '@promo/components/ui/range-date-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@promo/components/ui/select'
import { brazilianStates } from '@promo/constants/brazilian-states'
import { CompanyStatusEnum } from '@promo/enum/company-status'
import { firestore } from '@promo/lib/firebase/client'
import type { Company } from '@promo/types/firebase'
import { buildValueForCombobox } from '@promo/utils/build-value-for-combobox'
import { EMPTY_STRING } from '@promo/utils/generates-substrings-to-query-search'
import { normalizeText } from '@promo/utils/normalize-text'
import { and, collection, getDocs, query, where } from 'firebase/firestore'
import { X } from 'lucide-react'
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs'
import { useMemo } from 'react'

export function FilterSection() {
  const [search, setSearch] = useQueryState(
    'search',
    parseAsString.withDefault(''),
  )
  const [processId, setProcessId] = useQueryState(
    'processId',
    parseAsInteger.withDefault(0),
  )
  const [company, setCompany] = useQueryState(
    'company',
    parseAsString.withDefault(''),
  )

  const [state, setState] = useQueryState(
    'state',
    parseAsString.withDefault('all'),
  )
  const [city, setCity] = useQueryState('city', parseAsString.withDefault(''))
  const [status, setStatus] = useQueryState(
    'status',
    parseAsString.withDefault('all'),
  )

  const debouncedSetProcessId = useDebouncedCallback((value: number) => {
    setProcessId(value)
  }, 300)

  const debouncedSetCity = useDebouncedCallback((value: string) => {
    setCity(value)
  }, 300)

  const [startDate, setStartDate] = useQueryState(
    'startDate',
    parseAsString.withDefault(''),
  )
  const [endDate, setEndDate] = useQueryState(
    'endDate',
    parseAsString.withDefault(''),
  )

  const dateRange = useMemo((): DateRange | null => {
    if (!startDate || !endDate) return null

    try {
      return {
        start: startDate ? new Date(startDate) : null,
        end: endDate ? new Date(endDate) : null,
      }
    } catch {
      return null
    }
  }, [startDate, endDate])

  const handleDateRangeChange = (range: DateRange | null) => {
    if (!range) {
      setStartDate('')
      setEndDate('')
      return
    }

    setStartDate(range.start?.toISOString() || '')
    setEndDate(range.end?.toISOString() || '')
  }

  function handleClearFilters() {
    setSearch('')
    setProcessId(0)
    setCompany('')
    setState('all')
    setCity('')
    setStatus('all')
    setStartDate('')
    setEndDate('')
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

  const hasActiveFilters =
    search ||
    processId ||
    company ||
    state !== 'all' ||
    city ||
    status !== 'all' ||
    startDate !== '' ||
    endDate !== ''

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full min-w-0"
    >
      <Card className="p-3 sm:p-4">
        <CardHeader className="p-0 pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg sm:text-xl">Filtros</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Utilize os filtros abaixo para refinar sua busca por degustações
                de forma rápida e eficiente.
              </CardDescription>
            </div>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="shrink-0 w-full sm:w-auto"
              >
                <X className="size-4" />
                Limpar Filtros
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0 @container">
          <div className="grid gap-3 sm:gap-4 grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-3 @xl:grid-cols-4">
            <div className="flex min-w-0 flex-col gap-2">
              <Label className="text-sm font-medium">Processo ID</Label>
              <NumberInput
                value={processId}
                onChange={(value) => {
                  debouncedSetProcessId(value)
                }}
              />
            </div>

            <div className="flex min-w-0 flex-col gap-2">
              <Label className="text-sm font-medium">Empresa</Label>
              <Combobox
                value={company}
                onChange={(_value, raw: Company) => {
                  setCompany(raw.id)
                }}
                placeholder="Selecione uma empresa..."
                entity="company"
                queryFn={fetchCompanies}
              />
            </div>

            <div className="flex min-w-0 flex-col gap-2">
              <Label className="text-sm font-medium">Estado</Label>
              <Select
                value={state}
                onValueChange={(stateSelected) => {
                  setState(stateSelected)
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todos os estados" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  <SelectItem value="all">Todos os estados</SelectItem>
                  {brazilianStates.map((state) => (
                    <SelectItem key={state.value} value={state.value}>
                      {state.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex min-w-0 flex-col gap-2">
              <Label className="text-sm font-medium">Cidade</Label>
              <Input
                defaultValue={city}
                onChange={(event) => {
                  debouncedSetCity(event.target.value)
                }}
                placeholder="Nome da cidade..."
                className="w-full"
              />
            </div>

            <div className="flex min-w-0 flex-col gap-2">
              <Label className="text-sm font-medium">Status</Label>
              <Select
                value={status}
                onValueChange={(value) => {
                  setStatus(value)
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                  <SelectItem value="postponed">Adiado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex min-w-0 flex-col gap-2 @sm:col-span-2 @lg:col-span-1">
              <Label className="text-sm font-medium">Período</Label>
              <RangeDatePicker
                value={dateRange}
                onChange={handleDateRangeChange}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </MotionDiv>
  )
}
