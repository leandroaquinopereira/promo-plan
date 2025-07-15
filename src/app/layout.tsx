import './globals.css'

import type { Metadata } from 'next'
import { Open_Sans } from 'next/font/google'

import { Providers } from './providers'

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: {
    default: 'Promo Plan',
    template: '%s | Promo Plan',
  },
  description:
    'Sistema para promotora de eventos que realiza degustações no sul de Minas, otimizando a gestão de freelancers, checklists com fotos e geração automática de relatórios para fornecedores.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${openSans.className} antialiased min-h-dvh w-screen flex flex-col overflow-hidden`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
