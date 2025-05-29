import './globals.css'

import type { Metadata } from 'next'

import { Providers } from './providers'

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
      <body className="">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
