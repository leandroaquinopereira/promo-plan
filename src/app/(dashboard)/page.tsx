import { Button } from '@promo/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@promo/components/ui/card'
import { Muted, Small } from '@promo/components/ui/typography'
import { auth } from '@promo/lib/next-auth/auth'
import { cn } from '@promo/lib/utils'
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  CalendarClock,
  CalendarPlus,
  FileSliders,
  Users,
} from 'lucide-react'

import { GuideListItem } from './components/guide-list-item'

export default async function Home() {
  const session = await auth()

  const infoCards = [
    {
      title: 'Degustações Ativas',
      count: '8',
      icon: CalendarClock,
      color: 'text-orange-600',
    },
    {
      title: 'Freelancers disponíveis',
      count: '12',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Relatórios pendentes',
      count: '12',
      icon: FileSliders,
      color: 'text-green-600',
    },
    {
      title: 'Degustações concluídas',
      count: '12',
      icon: CalendarCheck,
      color: 'text-purple-600',
    },
  ]

  return (
    <div className="flex flex-col pt-4 gap-2">
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

      <div className="grid grid-cols-1 gap-2 sm:gap-y-2 sm:grid-cols-2 xl:grid-cols-4">
        {infoCards.map((info) => {
          const Icon = info.icon

          return (
            <Card key={info.title}>
              <CardContent>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-col items-start">
                    <Muted className="font-semibold truncate">
                      {info.title}
                    </Muted>
                    <span className="font-bold text-4xl">{info.count}</span>
                  </div>

                  <Icon className={cn('size-9 shrink-0 text-foreground')} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Card>
          <CardContent className="h-full">
            <CardHeader className="p-0 text-center sm:text-left">
              <CardTitle>
                <div className="flex items-center justify-center sm:justify-start w-full gap-2">
                  <BookOpen className="size-4" />
                  <p className="truncate sm:max-w-52 md:max-w-max">
                    Guia Completo do Sistema
                  </p>
                </div>
              </CardTitle>
              <CardDescription>
                Siga nosso guia passo a passo para criar e gerenciar degustações
                profissionais que encantam seus clientes
              </CardDescription>
            </CardHeader>

            <div className="flex flex-col gap-1 mt-4 ml-2 sm:ml-0">
              <GuideListItem>
                <Small>Como criar e gerenciar degustações</Small>
              </GuideListItem>
              <GuideListItem>
                <Small>Gerenciamento de freelancers</Small>
              </GuideListItem>
              <GuideListItem>
                <Small>Checklists e evidências fotográficas</Small>
              </GuideListItem>
              <GuideListItem>
                <Small>Geração de relatórios</Small>
              </GuideListItem>
            </div>

            <Button className="w-full mt-4 sm:mt-auto">
              Ver guia completo <ArrowRight className="size-4" />
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <CardHeader className="p-0 text-center sm:text-left">
              <CardTitle>
                <div className="flex items-center justify-center sm:justify-start w-full gap-2">
                  <BookOpen className="size-4" />
                  Ações Rápidas
                </div>
              </CardTitle>
              <CardDescription>
                Acesse rapidamente as funcionalidades mais utilizadas
              </CardDescription>
            </CardHeader>

            <div className="flex flex-col gap-2 mt-4">
              <Button variant="outline" className="w-full">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 grow">
                    <CalendarPlus className="size-4" />
                    Nova degustação
                  </div>

                  <ArrowRight className="size-4 ml-auto" />
                </div>
              </Button>
              <Button variant="outline" className="w-full">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 grow">
                    <Users className="size-4" />
                    Gerenciar freelancers
                  </div>

                  <ArrowRight className="size-4 ml-auto" />
                </div>
              </Button>
              <Button variant="outline" className="w-full">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 grow">
                    <CalendarCheck className="size-4" />
                    Degustações ativas
                  </div>

                  <ArrowRight className="size-4 ml-auto" />
                </div>
              </Button>
              <Button variant="outline" className="w-full">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 grow">
                    <FileSliders className="size-4" />
                    Relatórios
                  </div>

                  <ArrowRight className="size-4 ml-auto" />
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
