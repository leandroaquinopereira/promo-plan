'use client'

import { useRouter } from '@bprogress/next'
import { changeTastingStatusAction } from '@promo/actions/change-tasting-status'
import { deleteTastingAction } from '@promo/actions/delete-tasting'
import { TastingLogsSheet } from '@promo/components/tasting-logs-sheet'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@promo/components/ui/avatar'
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
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@promo/components/ui/hover-card'
import { TableCell, TableRow } from '@promo/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@promo/components/ui/tooltip'
import { FirebaseErrorCode } from '@promo/constants/firebase-error-code'
import { tastingStatusColors } from '@promo/constants/tasting-status-colors'
import { tastingStatusMap } from '@promo/constants/tasting-status-map'
import { TastingStatusEnum } from '@promo/enum/tasting-status'
import { dayjsApi } from '@promo/lib/dayjs'
import { cn } from '@promo/lib/utils'
import type { Tasting } from '@promo/types/firebase'
import { convertFirebaseDate } from '@promo/utils/date-helpers'
import { formatPhoneNumber } from '@promo/utils/format-phone-number'
import { getUserInitials } from '@promo/utils/get-user-initials'
import { StopIcon } from '@radix-ui/react-icons'
import {
  ArrowRight,
  Calendar,
  CheckIcon,
  Edit3,
  Eye,
  History,
  MapPin,
  MoreHorizontal,
  Package,
  Pause,
  Play,
  Trash2,
} from 'lucide-react'
import { Fragment, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'

import { EditTastingModal, EditTastingModalRef } from './edit-modal'

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const { execute: deleteTasting } = useServerAction(deleteTastingAction)
  const { execute: changeTastingStatus } = useServerAction(
    changeTastingStatusAction,
  )
  const router = useRouter()
  const editModalRef = useRef<EditTastingModalRef | null>(null)

  function handleViewTasting() {
    editModalRef.current?.open(tasting, true)
  }

  function handleEditTasting() {
    editModalRef.current?.open(tasting, false)
  }

  function handleViewTasks() {
    router.push(`/tastings/${tasting.id}/tasks`)
  }

  function handleDeleteTasting() {
    toast.promise(deleteTasting({ id: tasting.id.toString() }), {
      loading: 'Deletando degustação...',
      success: 'Degustação deletada com sucesso!',
      error: (error) => {
        if (error?.error?.code === FirebaseErrorCode.OBJECT_NOT_FOUND) {
          return 'Degustação não encontrada'
        }

        return 'Erro ao deletar degustação, tente novamente mais tarde'
      },
    })
  }

  function handleStartTasting() {
    toast.promise(
      changeTastingStatus({
        tastingId: tasting.id.toString(),
        status: TastingStatusEnum.IN_PROGRESS,
      }),
      {
        loading: 'Iniciando degustação...',
        success: (data) => {
          let message = 'Degustação iniciada com sucesso!'
          const [result, resultError] = data
          if (resultError?.message) {
            message = resultError?.message
          }

          if (result?.error?.message) {
            message = result?.error?.message
          }

          if (result?.success) {
            router.refresh()
          }

          return message
        },
        error: (error) => {
          let message = 'Erro ao iniciar degustação, tente novamente mais tarde'
          if (error?.error?.message) {
            message = error?.error?.message
          }

          return message
        },
      },
    )
  }

  function handlePauseTasting() {
    toast.promise(
      changeTastingStatus({
        tastingId: tasting.id.toString(),
        status: TastingStatusEnum.PAUSED,
      }),
      {
        loading: 'Pausando degustação...',
        success: (data) => {
          let message = 'Degustação pausada com sucesso!'
          const [result, resultError] = data
          if (resultError?.message) {
            message = resultError?.message
          }

          if (result?.error?.message) {
            message = result?.error?.message
          }

          if (result?.success) {
            router.refresh()
          }

          return message
        },
        error: (error) => {
          let message = 'Erro ao pausar degustação, tente novamente mais tarde'
          if (error?.error?.message) {
            message = error?.error?.message
          }

          return message
        },
      },
    )
  }

  function handleStopTasting() {
    toast.promise(
      changeTastingStatus({
        tastingId: tasting.id.toString(),
        status: TastingStatusEnum.CANCELLED,
      }),
      {
        loading: 'Cancelando degustação...',
        success: (data) => {
          let message = 'Degustação cancelada com sucesso!'
          const [result, resultError] = data
          if (resultError?.message) {
            message = resultError?.message
          }

          if (result?.error?.message) {
            message = result?.error?.message
          }

          if (result?.success) {
            router.refresh()
          }

          return message
        },
        error: (error) => {
          let message =
            'Erro ao cancelar degustação, tente novamente mais tarde'
          if (error?.error?.message) {
            message = error?.error?.message
          }

          return message
        },
      },
    )
  }

  function handleFinishTasting() {
    toast.promise(
      changeTastingStatus({
        tastingId: tasting.id.toString(),
        status: TastingStatusEnum.COMPLETED,
      }),
      {
        loading: 'Finalizando degustação...',
        success: (data) => {
          let message = 'Degustação finalizada com sucesso!'
          const [result, resultError] = data
          if (resultError?.message) {
            message = resultError?.message
          }

          if (result?.error?.message) {
            message = result?.error?.message
          }

          if (result?.success) {
            router.refresh()
          }

          return message
        },
        error: (error) => {
          let message =
            'Erro ao finalizar degustação, tente novamente mais tarde'
          if (error?.error?.message) {
            message = error?.error?.message
          }

          return message
        },
      },
    )
  }

  return (
    <>
      <TableRow
        className={cn(
          tasting.status === TastingStatusEnum.CANCELLED && 'opacity-50',
        )}
      >
        <TableCell>
          <Checkbox
            checked={isSelected}
            className="ml-2 mb-3"
            onCheckedChange={(checked) => {
              onSelectedRow?.(
                checked !== 'indeterminate' && checked,
                tasting.id.toString(),
              )
            }}
          />
        </TableCell>
        <TableCell>
          <div className="flex flex-col">
            <div className="font-medium">#{tasting.row}</div>
            <div className="text-xs text-muted-foreground">
              Processo {tasting.row}
            </div>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={(tasting.promoter as any).avatar}
                alt={(tasting.promoter as any).name}
              />
              <AvatarFallback>
                {getUserInitials((tasting.promoter as any).name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <div className="font-medium">
                {(tasting.promoter as any).name}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatPhoneNumber((tasting.promoter as any).phone)}
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <div className="font-medium">{tasting.company.name}</div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            <MapPin className="size-3 text-muted-foreground" />
            <div className="text-sm">
              <div>{tasting.city || '-'}</div>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            <Calendar className="size-3 text-muted-foreground" />
            <div className="text-sm">
              <div>{dayjsApi(tasting.startDate).format('DD/MM/YYYY')}</div>
              <div className="text-xs text-muted-foreground">
                até {dayjsApi(tasting.endDate).format('DD/MM/YYYY')}
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
          <HoverCard openDelay={200} closeDelay={100}>
            <HoverCardTrigger asChild>
              <div className="group cursor-pointer">
                <div className="flex items-center gap-3 p-2 rounded-lg border border-transparent group-hover:border-border group-hover:bg-muted/30 transition-all duration-200">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/10 to-blue-500/10 group-hover:from-purple-500/20 group-hover:to-blue-500/20 transition-all duration-200">
                    <Package className="size-4 text-purple-600 group-hover:scale-110 transition-transform duration-200" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        <p className="text-sm font-medium">
                          {tasting.products.length}
                        </p>
                        {tasting.products.length === 1 ? 'produto' : 'produtos'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                      Passe o mouse para ver
                    </p>
                  </div>
                </div>
              </div>
            </HoverCardTrigger>

            <HoverCardContent
              className="w-96 p-0 shadow-xl border-purple-100 dark:border-purple-900 overflow-hidden"
              align="start"
              side="bottom"
              sideOffset={8}
            >
              <div className="bg-gradient-to-br from-purple-50/50 to-blue-50/50 p-4 border-b dark:from-zinc-950/50 dark:to-zinc-950/50">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 dark:from-purple-500/20 dark:to-blue-500/20">
                    <Package className="size-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Produtos Selecionados</h4>
                    <p className="text-xs text-muted-foreground">
                      Degustação • {tasting.row}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                  {tasting.products.map((product, productIndex) => (
                    <div
                      key={productIndex}
                      className="group/item flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 hover:border-purple-200 hover:shadow-sm transition-all duration-200"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 shrink-0">
                        <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                          {String(productIndex + 1).padStart(2, '0')}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate group-hover/item:text-purple-700 dark:group-hover/item:text-purple-400 transition-colors">
                          {product.name}
                        </p>

                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Quantidade: {product.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {tasting.products.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center">
                      <Package className="size-8 text-gray-400 dark:text-zinc-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-500 dark:text-zinc-400 mb-1">
                      Nenhum produto
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Esta degustação não possui produtos
                    </p>
                  </div>
                )}
              </div>

              {tasting.products.length > 0 && (
                <div className="px-4 py-3 border-t bg-gray-50/50 dark:bg-zinc-900/50">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Total de produtos
                    </span>
                    <Badge variant="outline" className="font-semibold">
                      {tasting.products.length}
                    </Badge>
                  </div>
                </div>
              )}
            </HoverCardContent>
          </HoverCard>
        </TableCell>
        <TableCell>
          <Tooltip>
            <TooltipTrigger className="cursor-help">
              <div className="text-xs text-muted-foreground">
                {dayjsApi(tasting.createdAt).fromNow()}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              Criado em:{' '}
              {dayjsApi(tasting.createdAt).format('DD/MM/YYYY HH:mm')}
            </TooltipContent>
          </Tooltip>
        </TableCell>
        <TableCell>
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
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
              <TastingLogsSheet
                tastingId={tasting.id.toString()}
                onClose={() => setIsDropdownOpen(false)}
              >
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault()
                  }}
                >
                  <History className="size-4 mr-2" />
                  Ver logs
                </DropdownMenuItem>
              </TastingLogsSheet>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive group"
                onClick={handleDeleteTasting}
              >
                <Trash2 className="size-4 mr-2 text-destructive group-hover:text-inherit" />
                Excluir degustação
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      <EditTastingModal ref={editModalRef} />
    </>
  )
}
