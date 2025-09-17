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
import { appConfiguration } from '@promo/constants/app-configuration'
import { ProductStatusEnum } from '@promo/enum/product-status'
import { firestore } from '@promo/lib/firebase/client'
import type { PaginatedResponse } from '@promo/types/common'
import type { Product } from '@promo/types/firebase'
import { EMPTY_STRING } from '@promo/utils/generates-substrings-to-query-search'
import { normalizeText } from '@promo/utils/normalize-text'
import {
  and,
  collection,
  getCountFromServer,
  limit,
  onSnapshot,
  orderBy,
  query,
  type QueryFilterConstraint,
  type Unsubscribe,
  where,
} from 'firebase/firestore'
import { Package } from 'lucide-react'
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs'
import { useEffect, useRef, useState } from 'react'

import { EditProductModal, type EditProductModalRefs } from './edit-modal'
import { ListPaginationSection } from './list-pagination-section'
import { ListTableHeader } from './list-table-header'
import { ListTableRow } from './list-table-row'

export function ListContent() {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [response, setResponse] = useState<PaginatedResponse<Product>>({
    data: [],
    total: 0,
  })

  const editProductModalRef = useRef<EditProductModalRefs | null>(null)

  // Query states for filters
  const [search] = useQueryState('search', parseAsString.withDefault(''))
  const [status] = useQueryState('status', parseAsString.withDefault('all'))
  const [currentPage] = useQueryState('page', parseAsInteger.withDefault(1))

  const unsubscribeRef = useRef<Unsubscribe | null>(null)

  // Filter products based on query parameters
  useEffect(() => {
    async function setupRealtimeListener() {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }

      const coll = collection(firestore, Collections.PRODUCTS)
      const constraints: QueryFilterConstraint[] = []

      if (status !== 'all') {
        constraints.push(where('status', '==', status))
      }

      const q = query(
        coll,
        and(
          where('searchQuery', 'array-contains-any', [
            normalizeText(search) || EMPTY_STRING,
          ]),
          where(
            'row',
            '>=',
            (currentPage - 1) * appConfiguration.listItemsPerPage,
          ),
          where('status', '!=', ProductStatusEnum.DELETED),
          ...constraints,
        ),
        orderBy('row'),
        limit(appConfiguration.listItemsPerPage),
      )

      const countQuery = query(
        coll,
        and(
          where('searchQuery', 'array-contains', [
            normalizeText(search) || EMPTY_STRING,
          ]),
          where('status', '!=', ProductStatusEnum.DELETED),
          ...constraints,
        ),
      )

      unsubscribeRef.current = onSnapshot(
        q,
        async (snapshot) => {
          try {
            setIsLoading(true)

            const countSnapshot = await getCountFromServer(countQuery)
            const total = countSnapshot.data().count

            const products: Product[] = []

            for (const snap of snapshot.docs) {
              const product: Product = {
                id: snap.id,
                ...snap.data(),
              } as Product

              products.push(product)
            }

            setResponse({ total, data: products })
            setSelectedRows(new Set())
          } catch {
            setResponse({
              total: 0,
              data: [],
            })
          } finally {
            setIsLoading(false)
          }
        },
        (error) => {
          console.error('Error in realtime listener:', error)
          setResponse({
            total: 0,
            data: [],
          })

          setIsLoading(false)
        },
      )
    }

    setupRealtimeListener()

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
    }
  }, [currentPage, search, status])

  function handleSelectedRow(checked: boolean, productId: string) {
    setSelectedRows((prev) => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(productId)
      } else {
        newSet.delete(productId)
      }
      return newSet
    })
  }

  function handleSelectedAllRows(checked: boolean) {
    if (checked) {
      setSelectedRows(new Set(response.data.map((product) => product.id)))
    } else {
      setSelectedRows(new Set())
    }
  }

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="p-4">
        <CardContent className="p-0">
          <Table>
            <ListTableHeader
              isAllSelected={
                response.data.length > 0 &&
                selectedRows.size === response.data.length
              }
              onSelectedAllRows={handleSelectedAllRows}
            />
            <TableBody>
              {!isLoading &&
                response.data.map((product) => (
                  <ListTableRow
                    key={product.id}
                    data={product}
                    isSelected={selectedRows.has(product.id)}
                    onSelectedRow={handleSelectedRow}
                    editProductModalRef={editProductModalRef}
                  />
                ))}

              {!isLoading && response.data.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 py-10 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Package className="size-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Nenhum produto encontrado</p>
                        <p className="text-sm">
                          Tente ajustar os filtros ou adicionar um novo produto
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {isLoading && <TableSkeleton quantity={4} />}
            </TableBody>
          </Table>
        </CardContent>

        <ListPaginationSection
          totalProducts={response.total}
          totalProductsShowing={response.data.length}
        />
      </Card>

      <EditProductModal ref={editProductModalRef} />
    </MotionDiv>
  )
}
