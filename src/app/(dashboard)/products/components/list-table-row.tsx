'use client'

import { useRouter } from '@bprogress/next'
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
import { productStatusColors } from '@promo/constants/product-status-colors'
import { productStatusMap } from '@promo/constants/product-status-map'
import { dayjsApi } from '@promo/lib/dayjs'
import { cn } from '@promo/lib/utils'
import type { Product } from '@promo/types/firebase'
import { convertFirebaseDate } from '@promo/utils/date-helpers'
import { Edit3, Eye, MoreHorizontal, Package, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface ListTableRowProps {
  data: Product
  isSelected: boolean
  onSelectedRow?: (checked: boolean, productId: string) => void
}

export function ListTableRow({
  data: product,
  isSelected,
  onSelectedRow,
}: ListTableRowProps) {
  const router = useRouter()

  function handleViewProduct() {
    router.push(`/products/${product.id}/detail`)
  }

  function handleEditProduct() {
    router.push(`/products/${product.id}/edit`)
  }

  function handleDeleteProduct() {
    toast.error('Função não implementada')
  }

  return (
    <TableRow className={cn(product.status === 'inactive' && 'opacity-50')}>
      <TableCell>
        <Checkbox
          className="ml-2 mb-3"
          checked={isSelected}
          onCheckedChange={(checked) => {
            onSelectedRow?.(checked !== 'indeterminate' && checked, product.id)
          }}
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/10">
            <Package className="size-4 text-purple-600" />
          </div>
          <div>
            <div className="font-medium">{product.name}</div>
            <div className="text-xs text-muted-foreground">
              ID: {product.id}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Tooltip>
          <TooltipTrigger>
            <div className="max-w-xs">
              <p className="text-sm max-w-xs text-muted-foreground line-clamp-2">
                {product.description || 'Sem descrição'}
              </p>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs w-full">
            <p className="text-sm text-muted wrap-break-word">
              {product.description || 'Sem descrição'}
            </p>
          </TooltipContent>
        </Tooltip>
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={cn('w-fit text-xs', productStatusColors[product.status])}
        >
          {productStatusMap[product.status]}
        </Badge>
      </TableCell>
      <TableCell>
        <Tooltip>
          <TooltipTrigger className="cursor-help">
            <div className="text-xs text-muted-foreground">
              {dayjsApi(convertFirebaseDate(product.createdAt)).fromNow()}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            Criado em:{' '}
            {dayjsApi(convertFirebaseDate(product.createdAt)).format(
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
            <DropdownMenuItem onClick={handleViewProduct}>
              <Eye className="size-4 mr-2" />
              Visualizar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleEditProduct}>
              <Edit3 className="size-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive group"
              onClick={handleDeleteProduct}
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
