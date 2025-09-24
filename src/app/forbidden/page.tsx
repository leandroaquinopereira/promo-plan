import { MotionDiv } from '@promo/components/framer-motion/motion-div'
import { Button } from '@promo/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@promo/components/ui/card'
import { H3, Muted, P } from '@promo/components/ui/typography'
import { Home, Lock, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default async function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 py-8">
      <MotionDiv
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <Card className="text-center w-full">
          <CardHeader className="pb-4">
            <MotionDiv
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
            >
              <Lock className="h-8 w-8 text-destructive" />
            </MotionDiv>

            <CardTitle className="text-2xl font-bold text-foreground mb-2">
              Acesso Negado
            </CardTitle>

            <CardDescription className="text-base text-muted-foreground">
              Você não tem permissão para acessar esta página
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 px-4 pb-6">
            <div className="space-y-2">
              <H3 className="text-lg font-semibold text-foreground text-left">
                O que aconteceu?
              </H3>
              <P className="text-sm text-muted-foreground text-left">
                Sua conta não possui as permissões necessárias para acessar este
                recurso. Isso pode acontecer se você não tem o nível de acesso
                adequado ou se sua sessão expirou.
              </P>
            </div>

            <div className="space-y-1">
              <H3 className="text-lg font-semibold text-foreground text-left">
                O que você pode fazer?
              </H3>
              <ol className="space-y-1 text-left list-none">
                <li className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-destructive font-bold text-xs mt-0.5">
                    1.
                  </span>
                  Verifique se você está logado com a conta correta
                </li>
                <li className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-destructive font-bold text-xs mt-0.5">
                    2.
                  </span>
                  Entre em contato com o administrador se precisar de acesso
                </li>
                <li className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-destructive font-bold text-xs mt-0.5">
                    3.
                  </span>
                  Tente fazer login novamente
                </li>
              </ol>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Link href="/" className="flex items-center gap-2">
                <Button asChild className="w-full justify-center">
                  <Home className="h-4 w-4 flex-shrink-0" />
                  Voltar ao Início
                </Button>
              </Link>

              <Link href="/auth/sign-in" className="flex items-center gap-2">
                <Button
                  variant="outline"
                  asChild
                  className="w-full justify-center"
                >
                  <RefreshCw className="h-4 w-4 flex-shrink-0" />
                  Fazer Login Novamente
                </Button>
              </Link>
            </div>

            <div className="pt-3 border-t border-border">
              <Muted className="text-xs">Código de erro: 403 - Forbidden</Muted>
            </div>
          </CardContent>
        </Card>
      </MotionDiv>
    </div>
  )
}
