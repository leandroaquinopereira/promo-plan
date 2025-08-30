import { TableHead, TableHeader, TableRow } from '@promo/components/ui/table'

export function ListTableHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[80px]"></TableHead>
        <TableHead className="w-[100px]">ID</TableHead>
        <TableHead>Título</TableHead>
        <TableHead>Quantidade de Tarefas</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Degustação</TableHead>
        <TableHead>Empresa</TableHead>
      </TableRow>
    </TableHeader>
  )
}
