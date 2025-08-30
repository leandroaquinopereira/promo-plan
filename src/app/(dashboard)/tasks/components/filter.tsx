'use client'

import { useDebouncedCallback } from '@mantine/hooks'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@promo/components/ui/card'
import { Input } from '@promo/components/ui/input'
import { Label } from '@promo/components/ui/label'
import { parseAsString, useQueryState } from 'nuqs'

export function Filter() {
  const [search, setSearch] = useQueryState(
    'search',
    parseAsString.withDefault(''),
  )

  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    setSearch(value)
  }, 300)

  function handleClearFilters() {
    setSearch('')
  }

  return (
    <Card className="mb-4">
      <CardContent>
        <CardHeader className="p-0">
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <div className="grid gap-4 @md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">Nome do Produto</Label>
            <Input
              defaultValue={search}
              onChange={(event) => {
                debouncedSetSearch(event.target.value)
              }}
              placeholder="Buscar tarefa pelo id da degustação..."
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
