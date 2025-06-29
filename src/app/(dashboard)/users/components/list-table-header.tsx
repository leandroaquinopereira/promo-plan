import { Checkbox } from '@promo/components/ui/checkbox'
import { TableHead, TableHeader, TableRow } from '@promo/components/ui/table'

export function ListTableHeader() {
  return (
    <TableHeader>
      <TableRow className="h-16">
        <TableHead className="w-[50px]">
          <Checkbox />
        </TableHead>
        <TableHead>Usuário</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Situação</TableHead>
        <TableHead>Telefone</TableHead>
        <TableHead>Localização</TableHead>
        <TableHead>Permissão</TableHead>
        {/* <TableHead>Guias</TableHead> */}
        {/* <TableHead>Avaliação</TableHead> */}
        <TableHead>Último acesso</TableHead>
        <TableHead className="w-[120px]">Ações</TableHead>
      </TableRow>
    </TableHeader>
  )
}
