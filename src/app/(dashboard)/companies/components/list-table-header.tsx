import { Checkbox } from '@promo/components/ui/checkbox'
import { TableHead, TableHeader, TableRow } from '@promo/components/ui/table'

interface ListTableHeaderProps {
  isAllSelected: boolean
  onSelectedAllRows?: (checked: boolean) => void
}

export function ListTableHeader({
  isAllSelected,
  onSelectedAllRows,
}: ListTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow className="h-16">
        <TableHead className="w-[50px]">
          <Checkbox
            className="ml-2 mb-3"
            checked={isAllSelected}
            onCheckedChange={(checked) => {
              if (checked !== 'indeterminate') {
                onSelectedAllRows?.(checked)
              } else {
                onSelectedAllRows?.(false)
              }
            }}
          />
        </TableHead>
        <TableHead>Nome da Empresa</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Criado em</TableHead>
        <TableHead className="w-[120px]">Ações</TableHead>
      </TableRow>
    </TableHeader>
  )
}
