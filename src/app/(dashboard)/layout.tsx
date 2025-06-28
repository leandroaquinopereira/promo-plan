import { AuthProvider } from '@promo/components/auth-provider'
import { Header } from '@promo/components/header'
import { ScrollArea, ScrollBar } from '@promo/components/ui/scroll-area'
import { Muted } from '@promo/components/ui/typography'

type DashboardLayoutProps = {
  children: React.ReactNode
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <AuthProvider>
      <ScrollArea className="max-h-screen h-screen">
        <Header />
        <main className="w-screen flex min-h-[calc(100dvh-3.79rem)] flex-col max-w-6xl px-4 mx-auto mb-2">
          {children}

          <Muted className="text-center w-full mt-auto pb-2">
            &copy; {new Date().getFullYear()} Promo Plan. Todos os direitos
            reservados.
          </Muted>
        </main>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </AuthProvider>
  )
}
