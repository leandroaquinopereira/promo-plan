import { Collections } from '@promo/collections'
import { MotionDiv } from '@promo/components/framer-motion/motion-div'
import { P } from '@promo/components/ui/typography'
import { dayjsApi } from '@promo/lib/dayjs'
import { getFirebaseApps } from '@promo/lib/firebase/server'
import type { Guide } from '@promo/types/firebase'
import { EMPTY_STRING } from '@promo/utils/generates-substrings-to-query-search'
import { normalizeText } from '@promo/utils/normalize-text'
import { BookOpenText } from 'lucide-react'

import { GuideCard } from './components/guide-card'
import { HeaderSection } from './components/header-section'

type GuidesProps = {
  searchParams?: Promise<{
    q?: string
  }>
}

export default async function Guides({ searchParams }: GuidesProps) {
  const params = await searchParams

  const apps = await getFirebaseApps()
  let guides: Guide[] = []

  if (apps) {
    const guidesCollection = apps.firestore.collection(Collections.GUIDES)
    const snapshot = await guidesCollection
      .where('searchQuery', 'array-contains-any', [
        normalizeText(params?.q ?? '') || EMPTY_STRING,
      ])
      .orderBy('updatedAt', 'desc')
      .get()
    guides = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Guide[]
  }

  return (
    <div className="bg-background p-6 grow">
      <div className="max-w-7xl mx-auto flex flex-col grow">
        <HeaderSection />

        <MotionDiv
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {guides.map((guide) => (
            <GuideCard
              key={guide.id}
              guide={{
                ...guide,
                lastUpdated: dayjsApi(
                  guide.updatedAt instanceof Date
                    ? guide.updatedAt
                    : guide.updatedAt.toDate(),
                ).fromNow(),
              }}
            />
          ))}
        </MotionDiv>

        {guides.length === 0 && (
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center flex-col py-12 grow h-full mt-10"
          >
            <BookOpenText className="size-10 text-muted-foreground -mb-4" />
            <P className="text-muted-foreground">Nenhum guia encontrado.</P>
          </MotionDiv>
        )}
      </div>
    </div>
  )
}
