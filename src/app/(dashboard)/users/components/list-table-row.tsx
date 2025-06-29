import type { User } from '@promo/@types/firebase'
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
import { dayjsApi } from '@promo/lib/dayjs'
import { cn } from '@promo/lib/utils'
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

type ListTableRowProps = {
  data: User
}

export function ListTableRow({ data: user }: ListTableRowProps) {
  function getPermissionBadgeVariant(permission: 'Admin' | 'Freelancer') {
    return permission === 'Admin' ? 'default' : 'secondary'
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
    <TableRow className={cn(!user.active && 'opacity-50')}>
      <TableCell>
        <Checkbox />
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
          {getStatusIndicator(user.isOnline, user.isWorking)}
        </div>
      </TableCell>
      <TableCell>
        <Badge
          variant={user.active ? 'default' : 'secondary'}
          className="w-fit text-xs"
        >
          {user.active ? 'Ativo' : 'Inativo'}
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
      {/* <TableCell>
        <div className="text-sm font-medium">{user.guideCount}</div>
      </TableCell> */}
      {/* <TableCell>
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{user.rating}</span>
        </div>
      </TableCell> */}
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
              <DropdownMenuItem>
                <Eye className="size-4 mr-2" />
                Visualizar
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit3 className="size-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem>
                {user.active ? (
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
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive group">
                <Trash2 className="size-4 mr-2 text-destructive group-hover:text-inherit" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  )
}
