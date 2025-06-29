'use client'

import { useDebouncedCallback } from '@mantine/hooks'
import { MotionDiv } from '@promo/components/framer-motion/motion-div'
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
import { Search } from 'lucide-react'
import { useQueryState } from 'nuqs'

export function FilterSection() {
  const [search, setSearch] = useQueryState('search', {
    defaultValue: '',
  })

  const [state, setState] = useQueryState('state', {
    defaultValue: 'all',
  })

  const [permission, setPermission] = useQueryState('permission', {
    defaultValue: 'all',
  })

  const [status, setStatus] = useQueryState('status', {
    defaultValue: 'all',
  })

  function handleSetSearch(value: string) {
    setSearch(value)
  }

  const debouncedSetSearch = useDebouncedCallback(handleSetSearch, 500)

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="p-4">
        <CardHeader className="p-0">
          <CardTitle>Filtros</CardTitle>
          <CardDescription className="max-w-96">
            Utilize os filtros abaixo para refinar sua busca por usuários de
            forma rápida e eficiente.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">Nome ou Telefone</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => {
                    debouncedSetSearch(event.target.value)
                  }}
                  placeholder="Nome ou telefone..."
                  className="pl-9"
                />
              </div>
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
              <Label className="text-sm font-medium">Permissão</Label>
              <Select
                value={permission}
                onValueChange={(value) => {
                  setPermission(value)
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todas as permissões" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as permissões</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="freelancer">Freelancer</SelectItem>
                </SelectContent>
              </Select>
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
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="working">Trabalhando</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                  {/* <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem> */}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </MotionDiv>
  )
}
