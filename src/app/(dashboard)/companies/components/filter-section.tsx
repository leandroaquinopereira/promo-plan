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
import { Search, X } from 'lucide-react'
import { parseAsString, useQueryState } from 'nuqs'

export function FilterSection() {
  const [search, setSearch] = useQueryState(
    'search',
    parseAsString.withDefault(''),
  )
  const [status, setStatus] = useQueryState(
    'status',
    parseAsString.withDefault('all'),
  )

  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    setSearch(value)
  }, 300)

  function handleClearFilters() {
    setSearch('')
    setStatus('all')
  }

  const hasActiveFilters = search || status !== 'all'

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="p-4">
        <CardHeader className="p-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Filtros</CardTitle>
              <CardDescription className="max-w-96">
                Utilize os filtros abaixo para buscar empresas no sistema.
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
          <div className="grid gap-4 @md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">Nome da Empresa</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  defaultValue={search}
                  onChange={(event) => {
                    debouncedSetSearch(event.target.value)
                  }}
                  placeholder="Buscar empresa..."
                  className="pl-9"
                />
              </div>
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
                  <SelectItem value="active">Ativa</SelectItem>
                  <SelectItem value="inactive">Inativa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </MotionDiv>
  )
}
