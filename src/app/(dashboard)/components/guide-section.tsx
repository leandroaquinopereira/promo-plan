import { Button } from '@promo/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@promo/components/ui/card'
import { Small } from '@promo/components/ui/typography'
import { ArrowRight, BookOpen } from 'lucide-react'
import Link from 'next/link'

import { GuideListItem } from './guide-list-item'

export async function GuideSection() {
  return (
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

        <Link href="/guides" className="w-full mt-4 sm:mt-auto">
          <Button className="w-full">
            Ver guia completo <ArrowRight className="size-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
