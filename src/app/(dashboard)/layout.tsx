import { AuthAdapter } from '@promo/adapters/auth-adapter'
import { HeartBeatAdapter } from '@promo/adapters/heart-beat-adapter'
import { AppSidebar } from '@promo/components/app-sidebar'
import { DynamicBreadcrumb } from '@promo/components/dynamic-breadcrumb'
import { Notifications } from '@promo/components/notifications'
import { ModeToggle } from '@promo/components/theme/toggle'
import { ScrollArea, ScrollBar } from '@promo/components/ui/scroll-area'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@promo/components/ui/sidebar'
import { Muted } from '@promo/components/ui/typography'
import { auth } from '@promo/lib/next-auth/auth'

type DashboardLayoutProps = {
  children: React.ReactNode
  sheet: React.ReactNode
}

export default async function DashboardLayout({
  children,
  sheet,
}: DashboardLayoutProps) {
  const responseAuth = await auth()

  return (
    <AuthAdapter>
      <HeartBeatAdapter>
        <SidebarProvider>
          <AppSidebar
            user={{
              name: responseAuth?.user?.name,
              phoneNumber: responseAuth?.user?.phoneNumber,
              image: responseAuth?.user?.image,
            }}
          />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b border-border">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                {/* <Separator orientation="vertical" className="mr-2 h-4" /> */}
                <DynamicBreadcrumb />
              </div>
              <div className="ml-auto flex items-center gap-2 px-4">
                <Notifications />
                <ModeToggle />
              </div>
            </header>
            <ScrollArea className="max-h-screen h-screen">
              <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <main className="flex min-h-[calc(100vh-theme(spacing.16))] flex-col">
                  {children}

                  {sheet}
                  <Muted className="text-center w-full mt-auto pt-8 pb-2">
                    &copy; {new Date().getFullYear()} Promo Plan. Todos os
                    direitos reservados.
                  </Muted>
                </main>
              </div>
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </SidebarInset>
        </SidebarProvider>
      </HeartBeatAdapter>
    </AuthAdapter>
  )
}
