import { Muted } from '@promo/components/ui/typography'
import { UtensilsCrossed } from 'lucide-react'
import Link from 'next/link'

import { ForgotPasswordForm } from './form'

export default async function ForgotPassword() {
  return (
    <div className="w-full max-w-sm">
      <div className="flex flex-col gap-6 mb-6">
        <div className="flex flex-col items-center gap-2">
          <a href="#" className="flex flex-col items-center gap-2 font-medium">
            <div className="flex h-8 w-8 items-center justify-center rounded-md">
              <UtensilsCrossed className="size-6" />
            </div>
            <span className="sr-only">Promo Plan</span>
          </a>
          <h1 className="text-xl font-bold">Recupere sua senha</h1>
          <div className="text-center text-sm">
            <p>Digite seu número de celular para recuperar sua senha.</p>
          </div>

          <ForgotPasswordForm />
        </div>
      </div>

      <Muted className="mt-2">
        Lembrou sua senha?{' '}
        <Link
          href="/auth/sign-in"
          className="underline text-blue-600 dark:text-blue-300"
        >
          clique aqui
        </Link>
      </Muted>
    </div>
  )
}
