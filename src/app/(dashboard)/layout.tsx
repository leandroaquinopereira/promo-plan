import { AuthAdapter } from '@promo/adapters/auth-adapter'
import { HeartBeatAdapter } from '@promo/adapters/heart-beat-adapter'
import { Collections } from '@promo/collections'
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
import { AuthProvider } from '@promo/context/auth'
import { getFirebaseApps } from '@promo/lib/firebase/server'
import { auth } from '@promo/lib/next-auth/auth'
import type { User } from '@promo/types/firebase'

type DashboardLayoutProps = {
  children: React.ReactNode
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const responseAuth = await auth()

  if (!responseAuth?.user?.id) {
    return <div>User not authenticated.</div>
  }

  const apps = getFirebaseApps()

  if (!apps) {
    return <div>Firebase apps not initialized.</div>
  }

  const user = await apps.firestore
    .collection(Collections.USERS)
    .doc(responseAuth?.user?.id)
    .get()

  if (!user.exists) {
    return <div>User not found.</div>
  }

  const isAdmin = user.data()?.role.slug === 'admin'

  return (
    <AuthAdapter>
      <HeartBeatAdapter>
        <AuthProvider
          user={{ ...user.data(), id: user.id } as User}
          isAdmin={isAdmin}
        >
          <SidebarProvider>
            <AppSidebar
              user={{
                name: responseAuth?.user?.name,
                phoneNumber: responseAuth?.user?.phoneNumber,
                image: responseAuth?.user?.image,
                isAdmin,
              }}
            />
            <SidebarInset>
              <header className="flex h-16 sticky top-0 backdrop-blur-xl z-10 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b border-border">
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
                <div className="flex flex-col h-screen">
                  <div className="flex flex-1 flex-col gap-4 p-4 py-0">
                    <main className="flex min-h-[calc(100vh-theme(spacing.16))] flex-col justify-between">
                      {children}

                      <Muted className="static bottom-0 text-center w-full mt-auto pt-8 pb-2">
                        &copy; {new Date().getFullYear()} Promo Plan. Todos os
                        direitos reservados.
                      </Muted>
                    </main>
                  </div>
                  <ScrollBar orientation="vertical" />
                </div>
              </ScrollArea>
            </SidebarInset>
          </SidebarProvider>
        </AuthProvider>
      </HeartBeatAdapter>
    </AuthAdapter>
  )
}
