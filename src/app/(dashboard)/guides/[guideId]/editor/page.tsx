import { Collections } from '@promo/collections'
import { Editor } from '@promo/components/editor'
import { getFirebaseApps } from '@promo/lib/firebase/server'
import { notFound } from 'next/navigation'

type GuideEditorPageProps = {
  params: Promise<{
    guideId: string
  }>
}

export default async function GuideEditorPage({
  params,
}: GuideEditorPageProps) {
  const { guideId } = await params
  const apps = await getFirebaseApps()
  if (!apps) {
    throw new Error('Firebase apps not initialized')
  }

  const doc = await apps.firestore
    .collection(Collections.GUIDES)
    .doc(guideId)
    .get()

  if (!doc.exists) {
    notFound()
  }

  const guideData = doc.data()

  return (
    <div className="bg-background p-6 grow flex flex-col">
      <div className="max-w-7xl mx-auto flex flex-col grow w-full">
        <Editor
          guide={{
            category: guideData?.category || 'checklist',
            content: guideData?.content || '',
            description: guideData?.description || '',
            id: guideId,
            title: guideData?.title || '',
            lastUpdated: guideData?.updatedAt.toDate() || '',
            updatedAt: guideData?.updatedAt.toDate() || null,
          }}
        />
      </div>
    </div>
  )
}
