import { ModeToggle } from '@promo/components/theme/toggle'

import { LoginForm } from './form'

export default function SignInPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
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
