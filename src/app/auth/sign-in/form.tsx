import { Button } from '@promo/components/ui/button'
import { Input } from '@promo/components/ui/input'
import { Label } from '@promo/components/ui/label'
import { cn } from '@promo/lib/utils'
import { GalleryVerticalEnd, UtensilsCrossed } from 'lucide-react'

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <form>
        <div className="flex flex-col gap-6">
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
            <h1 className="text-xl font-bold">
              Bem-vindo ao Plano Promocional.
            </h1>
            <div className="text-center text-sm">
              <p>
                Digite seu número de telefone para entrar. Seus dados estão
                protegidos e seguros.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Telefone</Label>
              <Input
                id="phone"
                type="phone"
                placeholder="(123) 456-7890"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>
            <Button isLoading type="submit" className="w-full">
              Login
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
