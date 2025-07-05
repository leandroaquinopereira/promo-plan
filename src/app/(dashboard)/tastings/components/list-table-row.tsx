'use client'

import type { Tasting } from '@promo/@types/firebase'
import { Badge } from '@promo/components/ui/badge'
import { Button } from '@promo/components/ui/button'
import { Checkbox } from '@promo/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@promo/components/ui/dropdown-menu'
import { TableCell, TableRow } from '@promo/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@promo/components/ui/tooltip'
import { tastingStatusColors } from '@promo/constants/tasting-status-colors'
import { tastingStatusMap } from '@promo/constants/tasting-status-map'
import { dayjsApi } from '@promo/lib/dayjs'
import { cn } from '@promo/lib/utils'
import { convertFirebaseDate } from '@promo/utils/date-helpers'
import {
  Calendar,
  Edit3,
  Eye,
  MapPin,
  MoreHorizontal,
  Package,
  Trash2,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ListTableRowProps {
  data: Tasting
  isSelected: boolean
  onSelectedRow?: (checked: boolean, tastingId: string) => void
}

export function ListTableRow({
  data: tasting,
  isSelected,
  onSelectedRow,
}: ListTableRowProps) {
  const router = useRouter()

  function handleViewTasting() {
    router.push(`/tastings/${tasting.id}`)
  }

  function handleEditTasting() {
    router.push(`/tastings/${tasting.id}/edit`)
  }

  function handleDeleteTasting() {
    // TODO: Implementar lógica de deletar degustação
    console.log('Delete tasting:', tasting.id)
  }

  return (
    <TableRow className={cn(tasting.status === 'cancelled' && 'opacity-50')}>
      <TableCell>
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => {
            onSelectedRow?.(checked !== 'indeterminate' && checked, tasting.id)
          }}
        />
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <div className="font-medium">#{tasting.processId}</div>
          <div className="text-xs text-muted-foreground">
            Processo {tasting.processId}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <div className="font-medium">
            {typeof tasting.promoter === 'object'
              ? tasting.promoter.name
              : 'Promotora'}
          </div>
          <div className="text-xs text-muted-foreground">
            {typeof tasting.promoter === 'object' ? tasting.promoter.phone : ''}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="font-medium">{tasting.company}</div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <MapPin className="size-3 text-muted-foreground" />
          <div className="text-sm">
            <div>{tasting.city}</div>
            <div className="text-xs text-muted-foreground">{tasting.state}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Calendar className="size-3 text-muted-foreground" />
          <div className="text-sm">
            <div>
              {dayjsApi(convertFirebaseDate(tasting.startDate)).format(
                'DD/MM/YYYY',
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              até{' '}
              {dayjsApi(convertFirebaseDate(tasting.endDate)).format(
                'DD/MM/YYYY',
              )}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={cn('w-fit text-xs', tastingStatusColors[tasting.status])}
        >
          {tastingStatusMap[tasting.status]}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Package className="size-3 text-muted-foreground" />
          <Tooltip>
            <TooltipTrigger>
              <div className="text-sm">
                {tasting.products.length} produto
                {tasting.products.length !== 1 ? 's' : ''}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="max-w-xs">
                <p className="font-medium">Produtos:</p>
                <ul className="list-disc list-inside text-sm">
                  {tasting.products.map((product, index) => (
                    <li key={index}>{product}</li>
                  ))}
                </ul>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      </TableCell>
      <TableCell>
        <Tooltip>
          <TooltipTrigger className="cursor-help">
            <div className="text-xs text-muted-foreground">
              {dayjsApi(convertFirebaseDate(tasting.createdAt)).fromNow()}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            Criado em:{' '}
            {dayjsApi(convertFirebaseDate(tasting.createdAt)).format(
              'DD/MM/YYYY HH:mm',
            )}
          </TooltipContent>
        </Tooltip>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleViewTasting}>
              <Eye className="size-4 mr-2" />
              Visualizar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleEditTasting}>
              <Edit3 className="size-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive group"
              onClick={handleDeleteTasting}
            >
              <Trash2 className="size-4 mr-2 text-destructive group-hover:text-inherit" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}
