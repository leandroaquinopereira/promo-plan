import { MotionDiv } from '@promo/components/framer-motion/motion-div'
import { Button } from '@promo/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@promo/components/ui/card'
import { Muted } from '@promo/components/ui/typography'
import { auth } from '@promo/lib/next-auth/auth'
import { ArrowRight } from 'lucide-react'

export async function HomeSection() {
  const session = await auth()

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card>
        <CardContent>
          <CardHeader className="p-0">
            <CardTitle>
              {/* Bem vindo ao seu painel administrativo, {session?.user.name}! */}
              Olá, {session?.user.name}! 👋
            </CardTitle>
            <CardDescription>
              Bem-vindo(a) ao seu painel de controle de degustações! Aqui você
              encontra todas as ferramentas necessárias para gerenciar seus
              eventos promocionais, acompanhar resultados e criar experiências
              memoráveis para seus clientes. Organize suas degustações com
              praticidade e eficiência.
            </CardDescription>
          </CardHeader>

          <div className="w-full bg-muted p-3 rounded mt-4 flex items-center justify-between gap-2">
            <Muted>
              Há <strong>8</strong> eventos nos próximos 7 dias
            </Muted>

            <Button className="w-9 sm:w-fit">
              <span className="max-sm:hidden">Ver eventos</span>
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </MotionDiv>
  )
}
