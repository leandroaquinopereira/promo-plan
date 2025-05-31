import { AuthProvider } from '@promo/components/auth-provider'
import { Header } from '@promo/components/header'
import { Muted } from '@promo/components/ui/typography'

type DashboardLayoutProps = {
  children: React.ReactNode
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <AuthProvider>
      <Header />
      <main className="w-screen max-w-6xl px-4 mx-auto mb-2">{children}</main>

      <Muted className="text-center w-full mt-auto">
        &copy; {new Date().getFullYear()} Promo Plan. Todos os direitos
        reservados.
      </Muted>
    </AuthProvider>
  )
}
