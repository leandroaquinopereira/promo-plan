import { BackButton } from '@promo/components/back-button'
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
import { Home, RefreshCw, Search } from 'lucide-react'
import Link from 'next/link'

export default async function NotFoundPage() {
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
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/20"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
            >
              <Search className="h-8 w-8 text-muted-foreground" />
            </MotionDiv>

            <CardTitle className="text-2xl font-bold text-foreground mb-2">
              Página Não Encontrada
            </CardTitle>

            <CardDescription className="text-base text-muted-foreground">
              A página que você está procurando não existe ou foi movida
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 px-4 pb-6">
            <div className="space-y-2">
              <H3 className="text-lg font-semibold text-foreground text-left">
                O que aconteceu?
              </H3>
              <P className="text-sm text-muted-foreground text-left">
                A página que você tentou acessar não foi encontrada. Isso pode
                acontecer se o link estiver quebrado, a página foi movida ou
                removida, ou se você digitou o endereço incorretamente.
              </P>
            </div>

            <div className="space-y-1">
              <H3 className="text-lg font-semibold text-foreground text-left">
                O que você pode fazer?
              </H3>
              <ol className="space-y-1 text-left list-none">
                <li className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary font-bold text-xs mt-0.5">
                    1.
                  </span>
                  Verifique se o endereço foi digitado corretamente
                </li>
                <li className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary font-bold text-xs mt-0.5">
                    2.
                  </span>
                  Use a navegação do site para encontrar o que procura
                </li>
                <li className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary font-bold text-xs mt-0.5">
                    3.
                  </span>
                  Volte à página anterior ou ao início do site
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
                  Fazer Login
                </Button>
              </Link>

              <BackButton />
            </div>

            <div className="pt-3 border-t border-border">
              <Muted className="text-xs">Código de erro: 404 - Not Found</Muted>
            </div>
          </CardContent>
        </Card>
      </MotionDiv>
    </div>
  )
}
