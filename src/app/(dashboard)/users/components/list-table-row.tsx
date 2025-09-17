import { useRouter } from '@bprogress/next'
import { deleteUserAction } from '@promo/actions/delete-user'
import { toggleUserSituationAction } from '@promo/actions/toggle-user-situation'
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
import { TableCell, TableRow } from '@promo/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@promo/components/ui/tooltip'
import { UserSituationEnum } from '@promo/enum/user-situation'
import { UserStatusEnum } from '@promo/enum/user-status'
import { dayjsApi } from '@promo/lib/dayjs'
import { cn } from '@promo/lib/utils'
import type { User } from '@promo/types/firebase'
import { formatPhoneNumber } from '@promo/utils/format-phone-number'
import { formatWhatsAppUrl } from '@promo/utils/format-whats-app-url'
import { getUserInitials } from '@promo/utils/get-user-initials'
import {
  Edit3,
  Eye,
  MessageCircle,
  MoreHorizontal,
  Shield,
  Trash2,
  UserCheck,
  UserX,
} from 'lucide-react'
import Link from 'next/link'
import type { RefObject } from 'react'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'

import type { EditUserModalRefs } from './edit-modal'

type ListTableRowProps = {
  data: User
  onSelectedRow?: (checked: boolean, userId: string) => void
  isSelected?: boolean
  editUserModalRef: RefObject<EditUserModalRefs | null>
}

export function ListTableRow({
  data: user,
  isSelected,
  onSelectedRow,
  editUserModalRef,
}: ListTableRowProps) {
  const { execute } = useServerAction(toggleUserSituationAction)
  const { execute: deleteUser } = useServerAction(deleteUserAction)

  const router = useRouter()

  function getPermissionBadgeVariant(permission: string) {
    return permission === 'admin' ? 'default' : 'secondary'
  }

  async function handleToggleUserSituation(
    specificSituation: UserSituationEnum = UserSituationEnum.ACTIVE,
  ) {
    const toastId = toast.loading('Alterando situação do usuário...')
    try {
      const [result, resultError] = await execute({
        userId: user.id,
        situation: specificSituation,
      })

      if (resultError) {
        toast.error('Erro ao alterar situação do usuário', {
          description: resultError.message || 'Tente novamente mais tarde',
          id: toastId,
        })

        return
      }

      if (result.success) {
        toast.success('Situação do usuário alterada com sucesso', {
          id: toastId,
        })

        return
      }

      toast.error('Erro ao alterar situação do usuário', {
        description: result.message || 'Tente novamente mais tarde',
        id: toastId,
      })
    } catch (error) {
      toast.error('Erro ao alterar situação do usuário', {
        id: toastId,
      })
    }
  }

  async function handleDeleteUser() {
    const toastId = toast.loading('Deletando usuário...')
    try {
      const [result, resultError] = await deleteUser({
        userId: user.id,
      })

      if (resultError) {
        toast.error('Erro ao deletar usuário', {
          description: resultError.message || 'Tente novamente mais tarde',
          id: toastId,
        })

        return
      }

      if (result?.success) {
        toast.success('Usuário deletado com sucesso', {
          description:
            result?.message || 'O usuário foi removido permanentemente.',
          id: toastId,
        })

        return
      }

      toast.error('Erro ao deletar usuário', {
        description: result?.message || 'Tente novamente mais tarde',
        id: toastId,
      })
    } catch (error) {
      toast.error('Erro ao deletar usuário', {
        id: toastId,
      })
    }
  }

  function getStatusIndicator(isOnline: boolean, isWorking: boolean) {
    if (isWorking) {
      return (
        <div className="flex items-center gap-1.5">
          <div className="size-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-sm text-blue-600">Trabalhando</span>
        </div>
      )
    }

    if (isOnline) {
      return (
        <div className="flex items-center gap-1.5">
          <div className="size-2 bg-green-500 rounded-full" />
          <span className="text-sm text-green-600">Online</span>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-1.5">
        <div className="size-2 bg-gray-400 rounded-full" />
        <span className="text-sm text-gray-500">Offline</span>
      </div>
    )
  }

  return (
    <TableRow
      className={cn(
        user.situation !== UserSituationEnum.ACTIVE && 'opacity-50',
      )}
    >
      <TableCell>
        <Checkbox
          className="ml-2 mb-3"
          checked={isSelected}
          onCheckedChange={(checked) => {
            onSelectedRow?.(checked !== 'indeterminate' && checked, user.id)
          }}
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-xs text-muted-foreground">{user.email}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          {getStatusIndicator(
            user.status === UserStatusEnum.ONLINE,
            user.status === UserStatusEnum.WORKING,
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge
          variant={
            user.situation === UserSituationEnum.ACTIVE
              ? 'default'
              : 'secondary'
          }
          className="w-fit text-xs"
        >
          {user.situation === UserSituationEnum.ACTIVE ? 'Ativo' : 'Inativo'}
        </Badge>
      </TableCell>
      <TableCell>{formatPhoneNumber(user.phone)}</TableCell>
      <TableCell>
        <div className="text-sm">
          <div>{user.city}</div>
          <div className="text-xs text-muted-foreground">{user.state}</div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={getPermissionBadgeVariant(user.role.slug)}>
          {user.role.slug === 'admin' ? <Shield className="size-3" /> : null}
          {user.role.name}
        </Badge>
      </TableCell>
      <TableCell>
        <Tooltip>
          <TooltipTrigger disabled={!user.lastLoggedAt} className="cursor-help">
            <div className="text-xs text-muted-foreground capitalize">
              {user.lastLoggedAt ? dayjsApi(user.lastLoggedAt).fromNow() : '-'}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            Último acesso:{' '}
            {user.lastLoggedAt
              ? dayjsApi(user.lastLoggedAt).format('DD/MM/YYYY HH:mm')
              : 'Nunca'}
          </TooltipContent>
        </Tooltip>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Link
            href={formatWhatsAppUrl(user.phone)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="ghost" size="sm">
              <MessageCircle className="size-4" />
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => editUserModalRef.current?.open(user, true)}
              >
                <Eye className="size-4 mr-2" />
                Visualizar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editUserModalRef.current?.open(user, false)}
              >
                <Edit3 className="size-4 mr-2" />
                Editar
              </DropdownMenuItem>
              {user.situation !== UserSituationEnum.DELETED && (
                <DropdownMenuItem onClick={() => handleToggleUserSituation()}>
                  {user.situation === UserSituationEnum.ACTIVE ? (
                    <div className="flex items-center gap-2">
                      <UserX className="size-4 mr-2" />
                      Desativar
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <UserCheck className="size-4 mr-2" />
                      Ativar
                    </div>
                  )}
                </DropdownMenuItem>
              )}
              {user.situation !== UserSituationEnum.ACTIVE && (
                <DropdownMenuSeparator />
              )}
              {user.situation === UserSituationEnum.DELETED && (
                <DropdownMenuItem
                  onClick={() =>
                    handleToggleUserSituation(UserSituationEnum.ACTIVE)
                  }
                >
                  <UserCheck className="size-4 mr-2" />
                  Reativar usuário
                </DropdownMenuItem>
              )}
              {![UserSituationEnum.ACTIVE, UserSituationEnum.DELETED].includes(
                user.situation as UserSituationEnum,
              ) && (
                <DropdownMenuItem
                  className="text-destructive group"
                  onClick={handleDeleteUser}
                >
                  <Trash2 className="size-4 mr-2 text-destructive group-hover:text-inherit" />
                  Excluir
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  )
}
