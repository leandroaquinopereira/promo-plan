'use client'

import { Collections } from '@promo/collections'
import { MotionDiv } from '@promo/components/framer-motion/motion-div'
import { TableSkeleton } from '@promo/components/table-skeleton'
import { Card, CardContent } from '@promo/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@promo/components/ui/table'
import { TastingStatusEnum } from '@promo/enum/tasting-status'
import { firestore } from '@promo/lib/firebase/client'
import type { PaginatedResponse } from '@promo/types/common'
import type { Company, Product, Tasting, User } from '@promo/types/firebase'
import { convertFirebaseDate } from '@promo/utils/date-helpers'
import {
  and,
  collection,
  doc,
  getCountFromServer,
  getDoc,
  onSnapshot,
  query,
  type QueryFilterConstraint,
  Timestamp,
  type Unsubscribe,
  where,
} from 'firebase/firestore'
import { Utensils, Wine } from 'lucide-react'
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs'
import { useEffect, useRef, useState } from 'react'

import { ListPaginationSection } from './list-pagination-section'
import { ListTableHeader } from './list-table-header'
import { ListTableRow } from './list-table-row'

export function ListContent() {
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [response, setResponse] = useState<PaginatedResponse<Tasting>>({
    data: [],
    total: 0,
  })

  // Query states for filters
  const [search] = useQueryState('search', parseAsString.withDefault(''))
  const [processId] = useQueryState('processId', parseAsString.withDefault(''))
  const [company] = useQueryState('company', parseAsString.withDefault(''))
  const [state] = useQueryState('state', parseAsString.withDefault('all'))
  const [city] = useQueryState('city', parseAsString.withDefault(''))
  const [status] = useQueryState('status', parseAsString.withDefault('all'))

  const [startDate] = useQueryState('startDate', parseAsString.withDefault(''))
  const [endDate] = useQueryState('endDate', parseAsString.withDefault(''))

  const [currentPage] = useQueryState(
    'current-page',
    parseAsInteger.withDefault(1),
  )

  const unsubscribeRef = useRef<Unsubscribe | null>(null)

  // Filter tastings based on query parameters
  useEffect(() => {
    async function setup() {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }

      const coll = collection(firestore, Collections.TASTINGS)
      const constraints: QueryFilterConstraint[] = []

      if (status !== 'all') {
        constraints.push(where('status', '==', status))
      }

      if (processId) {
        constraints.push(where('row', '==', parseInt(processId)))
      }

      if (startDate && endDate) {
        try {
          const startDateParsed = startDate ? new Date(startDate) : null
          const endDateParsed = endDate ? new Date(endDate) : null

          if (startDateParsed && endDateParsed) {
            constraints.push(
              where('startDate', '>=', Timestamp.fromDate(startDateParsed)),
            )
            constraints.push(
              where('endDate', '<=', Timestamp.fromDate(endDateParsed)),
            )
          }
        } finally {
        }
      }

      if (company) {
        constraints.push(
          where(
            'company',
            '==',
            doc(collection(firestore, Collections.COMPANIES), company),
          ),
        )
      }

      const q = query(
        coll,
        and(where('status', '!=', TastingStatusEnum.DELETED), ...constraints),
      )

      const countQuery = query(
        coll,
        and(where('status', '!=', TastingStatusEnum.DELETED), ...constraints),
      )

      unsubscribeRef.current = onSnapshot(
        q,
        async (snapshot) => {
          try {
            const total = await getCountFromServer(countQuery)

            const tastings: Tasting[] = []

            const promoterColl = collection(firestore, Collections.USERS)
            const companyColl = collection(firestore, Collections.COMPANIES)
            const productColl = collection(firestore, Collections.PRODUCTS)

            const promoterCaching = new Map<string, User>()
            const companyCaching = new Map<string, Company>()
            const productCaching = new Map<string, Product>()

            for await (const snap of snapshot.docs) {
              const tasting: Tasting = {
                id: snap.id,
                ...snap.data(),
              } as unknown as Tasting

              // getting role reference and fetching role data
              const promoterRefStr = tasting.promoter
              const promoterId =
                typeof promoterRefStr === 'string'
                  ? String(promoterRefStr).replace('/users/', '')
                  : promoterRefStr.id

              let promoter: User | undefined = promoterCaching.get(promoterId)
              if (!promoter) {
                // if not cached, fetch from Firestore
                const promoterDoc = await getDoc(doc(promoterColl, promoterId))
                if (promoterDoc.exists()) {
                  promoter = {
                    id: promoterDoc.id,
                    ...promoterDoc.data(),
                  } as User

                  promoterCaching.set(promoterId, promoter)
                }
              }

              if (state !== 'all') {
                const promoterState = promoter?.state
                if (
                  !promoterState
                    ?.toLocaleLowerCase()
                    .includes(state.toLocaleLowerCase())
                ) {
                  continue
                }
              }

              if (city) {
                const promoterCity = promoter?.city
                if (
                  !promoterCity
                    ?.toLocaleLowerCase()
                    .includes(city.toLocaleLowerCase())
                ) {
                  continue
                }
              }

              tasting.promoter = promoter

              const companyRefStr = tasting.company
              const companyId =
                typeof companyRefStr === 'string'
                  ? String(companyRefStr).replace('/companies/', '')
                  : companyRefStr.id

              let company: Company | undefined = companyCaching.get(companyId)
              if (!company) {
                // if not cached, fetch from Firestore
                const companyDoc = await getDoc(doc(companyColl, companyId))
                if (companyDoc.exists()) {
                  company = {
                    id: companyDoc.id,
                    ...companyDoc.data(),
                  } as Company

                  companyCaching.set(companyId, company)
                }
              }

              tasting.company = company

              const productsRefStrs = tasting.products
              const products: Product[] = []
              for (const productRefStr of productsRefStrs) {
                const productId =
                  typeof productRefStr === 'string'
                    ? String(productRefStr).replace('/products/', '')
                    : productRefStr.id

                let product: Product | undefined = productCaching.get(productId)
                if (!product) {
                  const productDoc = await getDoc(doc(productColl, productId))
                  if (productDoc.exists()) {
                    product = {
                      id: productDoc.id,
                      ...productDoc.data(),
                    } as Product

                    productCaching.set(productId, product)
                    products.push(product)
                  }
                }
              }

              tasting.products = products
              tasting.createdAt = convertFirebaseDate(tasting.createdAt)
              tasting.startDate = convertFirebaseDate(tasting.startDate)
              tasting.endDate = convertFirebaseDate(tasting.endDate)
              tasting.updatedAt = convertFirebaseDate(tasting.updatedAt)

              tastings.push(tasting)
            }

            setResponse({
              data: tastings,
              total: total.data().count || 0,
            })

            setIsLoading(false)
          } catch (error) {
            setResponse({
              data: [],
              total: 0,
            })

            setIsLoading(false)
          }
        },
        (error) => {
          console.error('Error fetching tastings: ', error)
          setResponse({
            data: [],
            total: 0,
          })

          setIsLoading(false)
        },
      )
    }

    setup()

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
    }
  }, [processId, company, status, startDate, endDate, state, city])

  function handleSelectedRow(checked: boolean, tastingId: string) {
    setSelectedRows((prevSelected) => {
      const newSelected = new Set(prevSelected)
      if (checked) {
        newSelected.add(tastingId)
      } else {
        newSelected.delete(tastingId)
      }
      return newSelected
    })
  }

  function handleSelectedAllRows(checked: boolean) {
    if (checked) {
      setSelectedRows(
        new Set(response.data.map((tasting) => tasting.id.toString())),
      )
    } else {
      setSelectedRows(new Set())
    }
  }

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="px-4">
        <CardContent className="p-0">
          <Table>
            <ListTableHeader
              isAllSelected={
                selectedRows.size > 0 &&
                selectedRows.size === response.data.length
              }
              onSelectedAllRows={handleSelectedAllRows}
            />
            <TableBody>
              {!isLoading &&
                response.data.map((tasting) => (
                  <ListTableRow
                    key={tasting.id}
                    data={tasting}
                    isSelected={selectedRows.has(tasting.id.toString())}
                    onSelectedRow={handleSelectedRow}
                  />
                ))}

              {!isLoading && response.data.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="text-center text-muted-foreground p-20"
                  >
                    <Utensils className="mx-auto mb-4 size-12 text-muted-foreground" />
                    Nenhuma degustação encontrada.
                    <br />
                    Tente ajustar os filtros ou adicionar novas degustações.
                  </TableCell>
                </TableRow>
              )}

              {isLoading && <TableSkeleton quantity={8} />}
            </TableBody>
          </Table>
        </CardContent>

        <ListPaginationSection
          totalTastings={response.total || 0}
          totalTastingsShowing={response.data.length || 0}
        />
      </Card>
    </MotionDiv>
  )
}
