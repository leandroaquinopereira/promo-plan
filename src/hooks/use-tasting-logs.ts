'use client'

import type { TastingLog } from '@promo/@types/firebase'
import { Collections } from '@promo/collections'
import { firestore } from '@promo/lib/firebase/client'
import { convertFirebaseDate } from '@promo/utils/date-helpers'
import { queries } from '@promo/utils/queries'
import { useQuery } from '@tanstack/react-query'
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  where,
} from 'firebase/firestore'

export function useTastingLogs(tastingId: string) {
  return useQuery({
    queryKey: queries.tastingLogs.list(tastingId),
    queryFn: async () => {
      const tastingRef = doc(firestore, Collections.TASTINGS, tastingId)

      const q = query(
        collection(firestore, Collections.TASTING_LOGS),
        where('tasting', '==', tastingRef),
        orderBy('createdAt', 'desc'),
      )

      const querySnapshot = await getDocs(q)
      const logs: TastingLog[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        logs.push({
          id: doc.id,
          tasting: data.tasting,
          status: data.status,
          createdAt: convertFirebaseDate(data.createdAt),
          createdBy: data.createdBy,
        })
      })

      return logs
    },
    enabled: !!tastingId,
  })
}
