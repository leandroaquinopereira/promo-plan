import { ModeToggle } from '@promo/components/theme/toggle'
import { UtensilsCrossed } from 'lucide-react'

import { LoginForm } from './form'

export default function SignInPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6 mb-6">
          <div className="flex flex-col items-center gap-2">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md">
                <UtensilsCrossed className="size-6" />
              </div>
              <span className="sr-only">Promo Plan</span>
            </a>
            <h1 className="text-xl font-bold">Bem-vindo ao Promo Plan.</h1>
            <div className="text-center text-sm">
              <p>
                Digite seu número de telefone para entrar. Seus dados estão
                protegidos e seguros.
              </p>
            </div>
          </div>
        </div>
        <LoginForm />
      </div>

      <ModeToggle
        trigger={{
          className:
            'absolute top-4 right-4 border-0 shadow-none !bg-transparent hover:!bg-accent rounded-full',
        }}
      />
    </div>
  )
}
