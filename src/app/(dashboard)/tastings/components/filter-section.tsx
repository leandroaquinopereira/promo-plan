'use client'

import { useDebouncedCallback } from '@mantine/hooks'
import { MotionDiv } from '@promo/components/framer-motion/motion-div'
import { Button } from '@promo/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@promo/components/ui/card'
import { Input } from '@promo/components/ui/input'
import { Label } from '@promo/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@promo/components/ui/select'
import { brazilianStates } from '@promo/constants/brazilian-states'
import { Search, X } from 'lucide-react'
import { parseAsString, useQueryState } from 'nuqs'

export function FilterSection() {
  const [search, setSearch] = useQueryState(
    'search',
    parseAsString.withDefault(''),
  )
  const [processId, setProcessId] = useQueryState(
    'processId',
    parseAsString.withDefault(''),
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
  const [dateRange, setDateRange] = useQueryState(
    'dateRange',
    parseAsString.withDefault('all'),
  )

  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    setSearch(value)
  }, 300)

  const debouncedSetProcessId = useDebouncedCallback((value: string) => {
    setProcessId(value)
  }, 300)

  const debouncedSetCompany = useDebouncedCallback((value: string) => {
    setCompany(value)
  }, 300)

  const debouncedSetCity = useDebouncedCallback((value: string) => {
    setCity(value)
  }, 300)

  function handleClearFilters() {
    setSearch('')
    setProcessId('')
    setCompany('')
    setState('all')
    setCity('')
    setStatus('all')
    setDateRange('all')
  }

  const hasActiveFilters =
    search ||
    processId ||
    company ||
    state !== 'all' ||
    city ||
    status !== 'all' ||
    dateRange !== 'all'

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="p-4">
        <CardHeader className="p-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Filtros</CardTitle>
              <CardDescription className="max-w-96">
                Utilize os filtros abaixo para refinar sua busca por degustações
                de forma rápida e eficiente.
              </CardDescription>
            </div>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="shrink-0"
              >
                <X className="size-4" />
                Limpar Filtros
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0 @container">
          <div className="grid gap-4 @md:grid-cols-2 @lg:grid-cols-3 @xl:grid-cols-4">
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">Busca Geral</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  defaultValue={search}
                  onChange={(event) => {
                    debouncedSetSearch(event.target.value)
                  }}
                  placeholder="Empresa, promotora, cidade..."
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">Processo ID</Label>
              <Input
                defaultValue={processId}
                onChange={(event) => {
                  debouncedSetProcessId(event.target.value)
                }}
                placeholder="Ex: 2024001"
                type="number"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">Empresa</Label>
              <Input
                defaultValue={company}
                onChange={(event) => {
                  debouncedSetCompany(event.target.value)
                }}
                placeholder="Nome da empresa..."
              />
            </div>

            <div className="flex flex-col gap-2">
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
                <SelectContent>
                  <SelectItem value="all">Todos os estados</SelectItem>
                  {brazilianStates.map((state) => (
                    <SelectItem key={state.value} value={state.value}>
                      {state.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">Cidade</Label>
              <Input
                defaultValue={city}
                onChange={(event) => {
                  debouncedSetCity(event.target.value)
                }}
                placeholder="Nome da cidade..."
              />
            </div>

            <div className="flex flex-col gap-2">
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
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                  <SelectItem value="postponed">Adiado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">Período</Label>
              <Select
                value={dateRange}
                onValueChange={(value) => {
                  setDateRange(value)
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todos os períodos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os períodos</SelectItem>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="this-week">Esta semana</SelectItem>
                  <SelectItem value="this-month">Este mês</SelectItem>
                  <SelectItem value="this-year">Este ano</SelectItem>
                  <SelectItem value="last-month">Mês passado</SelectItem>
                  <SelectItem value="last-year">Ano passado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </MotionDiv>
  )
}
