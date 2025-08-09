import { Collections } from '@promo/collections'
import { ProductStatusEnum } from '@promo/enum/product-status'
import { dayjsApi } from '@promo/lib/dayjs'
import { getFirebaseApps } from '@promo/lib/firebase/server'
import type { Task } from '@promo/types/models/task'
import { convertFirebaseDate } from '@promo/utils/date-helpers'
import { notFound } from 'next/navigation'

import { TastingTasksHeader } from './components/header'
import { TastingTasksContent } from './components/tasks-content'

type TastingTasksPageProps = {
  params: Promise<{ tastingId: string }>
}

export default async function TastingTasksPage({
  params,
}: TastingTasksPageProps) {
  const { tastingId } = await params

  const apps = getFirebaseApps()
  if (!apps) {
    notFound()
  }

  try {
    // Fetch tasting document
    const tastingRef = apps.firestore
      .collection(Collections.TASTINGS)
      .doc(tastingId)

    const tastingDoc = await tastingRef.get()
    if (!tastingDoc.exists) {
      notFound()
    }

    const tastingData = tastingDoc.data()
    if (!tastingData) {
      notFound()
    }

    const companyRef = apps.firestore
      .collection(Collections.COMPANIES)
      .doc(tastingData.company.id)

    const productsRefStrs = tastingData.products || []
    const productIds = productsRefStrs
      .map((productRef: any) => {
        if (typeof productRef === 'string') {
          return String(productRef).replace('/products/', '')
        }
        return productRef?.id || productRef?.path?.split('/').pop() || ''
      })
      .filter(Boolean)

    const promoterRefStr = tastingData.promoter
    const promoterId =
      typeof promoterRefStr === 'string'
        ? String(promoterRefStr).replace('/users/', '')
        : promoterRefStr?.id || promoterRefStr?.path?.split('/').pop() || ''

    const [companyDoc, promoterDoc, ...productDocs] = await Promise.all([
      companyRef.get(),
      apps.firestore.collection(Collections.USERS).doc(promoterId).get(),
      ...productIds.map((id: string) =>
        apps.firestore.collection(Collections.PRODUCTS).doc(id).get(),
      ),
    ])

    const products = productDocs
      .filter((doc) => doc.exists)
      .map((doc) => {
        const data = doc.data()!
        return {
          id: doc.id,
          name: data.name || '',
          description: data.description || '',
          status: data.status || ProductStatusEnum.ACTIVE,
          createdAt: convertFirebaseDate(data.createdAt),
          updatedAt: convertFirebaseDate(data.updatedAt),
          createdBy: data.createdBy || '',
          updatedBy: data.updatedBy || '',
        }
      })

    const now = dayjsApi()
    const nowInStr = now.format('YYYYMMDD')

    const packageRef = apps.firestore
      .collection(Collections.TASTINGS)
      .doc(tastingId)
      .collection(Collections.TASK_PACKAGES)
      .doc(`package_${tastingId}_day_${nowInStr}`)

    const tasks = await packageRef.collection(Collections.TASKS).get()
    const tasksData = tasks.docs.map((doc) => {
      const data = doc.data()
      if (!data) {
        return null
      }

      return {
        ...data,
        completedAt: data?.completedAt
          ? convertFirebaseDate(data?.completedAt)
          : undefined,
        id: doc.id,
      } as unknown as Task
    })

    return (
      <div className="container space-y-6 p-4 mx-auto">
        <TastingTasksHeader
          tasting={{
            id: tastingRef.id,
            company: {
              name: companyDoc.data()?.name || '',
            },
          }}
        />

        <TastingTasksContent
          tasting={{
            startDate: convertFirebaseDate(tastingData.startDate).toISOString(),
            endDate: convertFirebaseDate(tastingData.endDate).toISOString(),
            products,
            company: {
              name: companyDoc.data()?.name || '',
            },
            promoter: {
              name: promoterDoc.data()?.name || '',
              phone: promoterDoc.data()?.phone || '',
              city: promoterDoc.data()?.city || '',
              state: promoterDoc.data()?.state || '',
            },
            tasks: tasksData.filter((task) => task !== null),
          }}
        />
      </div>
    )
  } catch (error) {
    notFound()
  }
}
