'use client'

import { AppProgressProvider as ProgressProvider } from '@bprogress/next'
import { MantineProvider } from '@mantine/core'
import { ThemeProvider } from '@promo/components/theme/provider'
import { Toaster } from '@promo/components/ui/sonner'
import { TooltipProvider } from '@promo/components/ui/tooltip'
import { getQueryClient } from '@promo/lib/react-query'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { SessionProvider } from 'next-auth/react'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import type { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <MantineProvider>
        <ProgressProvider
          shallowRouting
          height="4px"
          startOnLoad
          options={{
            showSpinner: false,
          }}
        >
          <TooltipProvider>
            <NuqsAdapter>
              <SessionProvider>
                <QueryClientProvider client={queryClient}>
                  {children}
                  <ReactQueryDevtools />
                </QueryClientProvider>
              </SessionProvider>
            </NuqsAdapter>
            <Toaster richColors />
          </TooltipProvider>
        </ProgressProvider>
      </MantineProvider>
    </ThemeProvider>
  )
}
