import { auth } from '@promo/lib/next-auth/auth'
import { formatPhoneNumber } from '@promo/utils/format-phone-number'
import { formatUsername } from '@promo/utils/format-username'
import { Bell, Cog, User } from 'lucide-react'
import Link from 'next/link'

import { LogoutButton } from './logout-button'
import { ModeToggleSub } from './theme/toggle'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Muted, P, Small } from './ui/typography'

export async function Header() {
  const responseAuth = await auth()

  return (
    <header className="flex justify-between items-center px-4 py-2 border-b border-input shadow-input">
      <Link className="text-xl text-foreground" href="/">
        Promo Plan
      </Link>

      <div className="flex items-center gap-0.5">
        <Button className="rounded-full" variant="ghost" size="icon">
          <Bell className="size-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className="cursor-pointer">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback className="flex items-center justify-center text-xs">
                {responseAuth?.user.name
                  ? formatUsername(responseAuth?.user?.name)
                  : 'UU'}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={6}>
            <DropdownMenuGroup>
              <div className="flex items-center gap-4 w-64 p-2">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback className="flex items-center justify-center text-xs">
                    {responseAuth?.user.name
                      ? formatUsername(responseAuth?.user?.name)
                      : 'UU'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-start justify-start gap-0.5 flex-col">
                  <P className="text-sm truncate max-w-40">
                    {responseAuth?.user?.name}
                  </P>
                  <Muted className="text-xs">
                    {responseAuth?.user.phoneNumber
                      ? formatPhoneNumber(responseAuth?.user?.phoneNumber)
                      : '---'}
                  </Muted>
                </div>
              </div>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-foreground">
              <Cog className="size-4 text-foreground" />
              <Small>Configurações</Small>
            </DropdownMenuItem>
            <ModeToggleSub />
            <DropdownMenuItem className="text-foreground">
              <User className="size-4 text-foreground" />
              <Small>Perfil</Small>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <LogoutButton />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
