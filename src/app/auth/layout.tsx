import { ModeToggle } from '@promo/components/theme/toggle'

type AuthLayoutProps = Readonly<{
  children: React.ReactNode[] | React.ReactNode
}>

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      {children}

      <ModeToggle
        trigger={{
          className:
            'absolute top-4 right-4 border-0 shadow-none !bg-transparent hover:!bg-accent rounded-full',
        }}
      />
    </div>
  )
}
