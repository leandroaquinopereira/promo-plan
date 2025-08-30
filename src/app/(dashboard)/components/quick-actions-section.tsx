import { Button } from '@promo/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@promo/components/ui/card'
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  CalendarPlus,
  FileSliders,
  Users,
} from 'lucide-react'
import Link from 'next/link'

export async function QuickActionsSection() {
  return (
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
          <Link href="/tastings/register">
            <Button variant="outline" className="w-full">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 grow">
                  <CalendarPlus className="size-4" />
                  Nova degustação
                </div>

                <ArrowRight className="size-4 ml-auto" />
              </div>
            </Button>
          </Link>
          <Link href="/users/register">
            <Button variant="outline" className="w-full">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 grow">
                  <Users className="size-4" />
                  Gerenciar Usuários
                </div>

                <ArrowRight className="size-4 ml-auto" />
              </div>
            </Button>
          </Link>
          <Link href="/tastings?status=active">
            <Button variant="outline" className="w-full">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 grow">
                  <CalendarCheck className="size-4" />
                  Degustações ativas
                </div>

                <ArrowRight className="size-4 ml-auto" />
              </div>
            </Button>
          </Link>
          <Link href="/tastings/reports">
            <Button variant="outline" className="w-full">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 grow">
                  <FileSliders className="size-4" />
                  Relatórios
                </div>

                <ArrowRight className="size-4 ml-auto" />
              </div>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
