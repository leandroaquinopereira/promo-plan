'use client'

import { queries } from '@promo/utils/queries'
import { useQuery } from '@tanstack/react-query'
import { Bell, CheckCheck, Inbox } from 'lucide-react'
import { useSession } from 'next-auth/react'

import { Button } from './ui/button'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Separator } from './ui/separator'
import { Muted } from './ui/typography'

export function Notifications() {
  const session = useSession()

  const { data: notifications } = useQuery({
    queryKey: queries.notifications.list(session.data?.user.phoneNumber || ''),
    queryFn: async () => {
      return []
    },
    enabled: !!session.data,
  })

  const totalNotifications = notifications?.length || 0

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="rounded-full relative" variant="ghost" size="icon">
          <Bell className="size-5" />
          {totalNotifications > 0 && (
            <div className="absolute top-0 right-0.5 size-4 p-1 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-[8px] text-muted">
                {totalNotifications > 9 ? '9+' : totalNotifications}
              </span>
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="p-0">
        <div className="h-full w-full flex justify-between items-center px-3 py-2">
          <span className="text-sm font-medium">Notificações</span>
          <span className="text-sm font-bold">{totalNotifications}</span>
        </div>
        <Separator orientation="horizontal" />

        {totalNotifications === 0 && (
          <div className="p-4 w-full text-center text-sm text-muted-foreground flex flex-col gap-3 justify-center items-center">
            <p>Você não possui nenhuma notificação no momento</p>
            <Inbox
              className="size-8 text-zinc-400 dark:text-zinc-700"
              strokeWidth={1}
            />
          </div>
        )}

        {notifications?.map((_, notificationIndex) => {
          return (
            <div className="flex flex-col p-1" key={notificationIndex}>
              <div className="flex items-start rounded justify-start gap-1 flex-col w-full px-3 py-2 hover:bg-muted">
                <div className="flex items-start justify-between gap-2 w-full mb-2">
                  <p className="text-wrap text-sm">
                    Freelancer Maria comprovou presenca
                  </p>
                  <button className="mt-1 cursor-pointer">
                    <CheckCheck className="size-4" />
                  </button>
                </div>
                <Muted className="text-xs">1 dia atrás</Muted>
              </div>
            </div>
          )
        })}

        <Separator orientation="horizontal" />
        <div className="p-1">
          <Button className="w-full" variant="ghost">
            Marcar todas como lidas
            <CheckCheck className="size-4" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
