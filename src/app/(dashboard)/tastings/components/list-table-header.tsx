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
        <TableHead>Processo</TableHead>
        <TableHead>Promotora</TableHead>
        <TableHead>Empresa</TableHead>
        <TableHead>Localização</TableHead>
        <TableHead>Período</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Produtos</TableHead>
        <TableHead>Criado em</TableHead>
        <TableHead className="w-[120px]">Ações</TableHead>
      </TableRow>
    </TableHeader>
  )
}
