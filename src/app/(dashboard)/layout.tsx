import { AuthProvider } from '@promo/components/auth-provider'
import { Header } from '@promo/components/header'

type DashboardLayoutProps = {
  children: React.ReactNode
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <AuthProvider>
      <Header />
      <main>{children}</main>
    </AuthProvider>
  )
}
