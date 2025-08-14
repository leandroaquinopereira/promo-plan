'use client'

import { useRouter } from '@bprogress/next'
import { deleteCompanyAction } from '@promo/actions/delete-company'
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
import { companyStatusColors } from '@promo/constants/company-status-colors'
import { companyStatusMap } from '@promo/constants/company-status-map'
import { dayjsApi } from '@promo/lib/dayjs'
import { cn } from '@promo/lib/utils'
import type { Company } from '@promo/types/firebase'
import { convertFirebaseDate } from '@promo/utils/date-helpers'
import { Building, Edit3, Eye, MoreHorizontal, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'

interface ListTableRowProps {
  data: Company
  isSelected: boolean
  onSelectedRow?: (checked: boolean, companyId: string) => void
}

export function ListTableRow({
  data: company,
  isSelected,
  onSelectedRow,
}: ListTableRowProps) {
  const { execute } = useServerAction(deleteCompanyAction)
  const router = useRouter()

  function handleViewCompany() {
    router.push(`/companies/${company.id}/detail`)
  }

  function handleEditCompany() {
    router.push(`/companies/${company.id}/edit`)
  }

  async function handleDeleteCompany() {
    try {
      toast.promise(
        execute({
          id: company.id,
        }),
        {
          loading: 'Deletando empresa...',
          success: (_result) => {
            const [result, resultError] = _result

            if (resultError) {
              return resultError.message
            }

            if (!result?.success) {
              return result?.error?.message || 'Erro ao deletar empresa'
            }

            return 'Empresa deletada com sucesso.'
          },
          error: (error) => {
            if (error instanceof Error) {
              return error.message
            }

            return 'Erro ao deletar empresa.'
          },
        },
      )
    } catch (error) {
      toast.error('Erro ao deletar empresa', {
        description: 'Tente novamente mais tarde',
      })
    }
  }

  return (
    <TableRow className={cn(company.status === 'inactive' && 'opacity-50')}>
      <TableCell>
        <Checkbox
          className="ml-2 mb-3"
          checked={isSelected}
          onCheckedChange={(checked) => {
            onSelectedRow?.(checked !== 'indeterminate' && checked, company.id)
          }}
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10">
            <Building className="size-4 text-blue-600" />
          </div>
          <div>
            <div className="font-medium">{company.name}</div>
            <div className="text-xs text-muted-foreground">
              ID: {company.id}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={cn('w-fit text-xs', companyStatusColors[company.status])}
        >
          {companyStatusMap[company.status]}
        </Badge>
      </TableCell>
      <TableCell>
        <Tooltip>
          <TooltipTrigger className="cursor-help">
            <div className="text-xs text-muted-foreground">
              {dayjsApi(convertFirebaseDate(company.createdAt)).fromNow()}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            Criado em:{' '}
            {dayjsApi(convertFirebaseDate(company.createdAt)).format(
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
            <DropdownMenuItem onClick={handleViewCompany}>
              <Eye className="size-4 mr-2" />
              Visualizar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleEditCompany}>
              <Edit3 className="size-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive group"
              onClick={handleDeleteCompany}
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
