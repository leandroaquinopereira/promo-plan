import { Collections } from '@promo/collections'
import { Button } from '@promo/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@promo/components/ui/card'
import { Muted, Small } from '@promo/components/ui/typography'
import { getFirebaseApps } from '@promo/lib/firebase/server'
import type { Guide } from '@promo/types/firebase'
import { ArrowRight, BookOpen, Inbox } from 'lucide-react'
import Link from 'next/link'

export async function GuideSection() {
  const apps = await getFirebaseApps()
  const guides = await apps?.firestore
    .collection(Collections.GUIDES)
    .limit(5)
    .get()

  const guidesData = guides?.docs.map((doc) => {
    return {
      id: doc.id,
      ...doc.data(),
    }
  }) as Guide[]

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
            Siga nosso guia passo a passo para utilizar e gerenciar o sistema de
            forma eficiente no seu dia a dia operacional.
          </CardDescription>
        </CardHeader>

        <div className="flex flex-col gap-1 mt-4 ml-2 sm:ml-0">
          {guidesData.length === 0 && (
            <div className="flex flex-col gap-1 items-center justify-center py-12">
              <Inbox
                className="size-10 text-muted-foreground"
                strokeWidth={1}
              />
              <Muted>Nenhum guia encontrado</Muted>
            </div>
          )}
          {guidesData.map((guide) => (
            <div
              className="w-full flex items-center justify-between"
              key={guide.id}
            >
              <Small>{guide.title}</Small>
              <Link href={`/guides/${guide.id}/editor`}>
                <Button variant="outline" size="icon">
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {guidesData.length !== 0 && (
          <Link href="/guides" className="w-full mt-4 sm:mt-auto">
            <Button className="w-full">
              Ver guia completo <ArrowRight className="size-4" />
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
