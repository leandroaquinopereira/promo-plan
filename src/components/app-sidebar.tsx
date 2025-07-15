'use client'

import { formatPhoneNumber } from '@promo/utils/format-phone-number'
import { formatUsername } from '@promo/utils/format-username'
import {
  BookOpen,
  Building,
  ChevronsUpDown,
  Command,
  Home,
  Package,
  Settings,
  User,
  Users,
  Utensils,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { LogoutButton } from './logout-button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from './ui/sidebar'
import { Muted, P } from './ui/typography'

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    name?: string | null
    phoneNumber?: string | null
    image?: string | null
  }
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Promo Plan</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem key="dashboard">
                <SidebarMenuButton
                  asChild
                  isActive={pathname === '/' && pathname.startsWith('/')}
                >
                  <Link href="/">
                    <Home />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem key="guides">
                <SidebarMenuButton
                  asChild
                  isActive={
                    (pathname === '/guides' ||
                      pathname.startsWith('/guides')) &&
                    pathname !== '/'
                  }
                >
                  <Link href="/guides">
                    <BookOpen />
                    <span>Guias</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem key="tastings">
                <SidebarMenuButton
                  asChild
                  isActive={
                    (pathname === '/tastings' ||
                      pathname.startsWith('/tastings')) &&
                    pathname !== '/'
                  }
                >
                  <Link href="/tastings">
                    <Utensils />
                    <span>Degustações</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem key="companies">
                <SidebarMenuButton
                  asChild
                  isActive={
                    (pathname === '/companies' ||
                      pathname.startsWith('/companies')) &&
                    pathname !== '/'
                  }
                >
                  <Link href="/companies">
                    <Building />
                    <span>Empresas</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem key="products">
                <SidebarMenuButton
                  asChild
                  isActive={
                    (pathname === '/products' ||
                      pathname.startsWith('/products')) &&
                    pathname !== '/'
                  }
                >
                  <Link href="/products">
                    <Package />
                    <span>Produtos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem key="users">
                <SidebarMenuButton
                  asChild
                  isActive={
                    (pathname === '/users' || pathname.startsWith('/users')) &&
                    pathname !== '/'
                  }
                >
                  <Link href="/users">
                    <Users />
                    <span>Usuários</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={user?.image || 'https://github.com/shadcn.png'}
                      alt={user?.name || 'Usuário'}
                    />
                    <AvatarFallback className="rounded-lg">
                      {user?.name ? formatUsername(user.name) : 'UU'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <P className="truncate font-semibold text-sm">
                      {user?.name || 'Usuário'}
                    </P>
                    <Muted className="truncate text-xs">
                      {user?.phoneNumber
                        ? formatPhoneNumber(user.phoneNumber)
                        : '---'}
                    </Muted>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                align="start"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={user?.image || 'https://github.com/shadcn.png'}
                        alt={user?.name || 'Usuário'}
                      />
                      <AvatarFallback className="rounded-lg">
                        {user?.name ? formatUsername(user.name) : 'UU'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <P className="truncate font-semibold text-sm">
                        {user?.name || 'Usuário'}
                      </P>
                      <Muted className="truncate text-xs">
                        {user?.phoneNumber
                          ? formatPhoneNumber(user.phoneNumber)
                          : '---'}
                      </Muted>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <LogoutButton />
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
