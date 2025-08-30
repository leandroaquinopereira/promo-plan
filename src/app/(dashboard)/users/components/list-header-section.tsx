import { Button } from '@promo/components/ui/button'
import { CardDescription, CardHeader } from '@promo/components/ui/card'
import { Trash2 } from 'lucide-react'

import { DisableAllUsersSelected } from './disable-all-users-selected'

type ListHeaderSectionProps = {
  totalUsers: number
  onDeleteSelected?: () => void
}

export function ListHeaderSection({
  totalUsers = 0,
  onDeleteSelected,
}: ListHeaderSectionProps) {
  return (
    <CardHeader className="p-0">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3>Lista de Usuários</h3>
          <CardDescription>{totalUsers} usuários cadastrados</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <DisableAllUsersSelected />
          <Button
            onClick={onDeleteSelected}
            variant="destructive"
            size="sm"
            className=""
          >
            <Trash2 className="size-4" />
            Excluir Selecionados
          </Button>
        </div>
      </div>
    </CardHeader>
  )
}
