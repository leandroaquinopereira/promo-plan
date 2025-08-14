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
import { CompanyStatusEnum } from '@promo/enum/company-status'
import { firestore } from '@promo/lib/firebase/client'
import type { Company } from '@promo/types/firebase'
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
import { Building } from 'lucide-react'
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs'
import { useEffect, useRef, useState } from 'react'

import { ListPaginationSection } from './list-pagination-section'
import { ListTableHeader } from './list-table-header'
import { ListTableRow } from './list-table-row'

export function ListContent() {
  const unsubscribeRef = useRef<Unsubscribe | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [response, setResponse] = useState<{
    total: number
    companies: Company[]
  }>({
    total: 0,
    companies: [],
  })

  const [search] = useQueryState('search', parseAsString.withDefault(''))
  const [status] = useQueryState('status', parseAsString.withDefault('all'))
  const [currentPage] = useQueryState(
    'current-page',
    parseAsInteger.withDefault(1),
  )

  useEffect(() => {
    function setupRealtimeListener() {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }

      const coll = collection(firestore, Collections.COMPANIES)
      const constraints: QueryFilterConstraint[] = [
        // where('status', '!=', CompanyStatusEnum.DELETED),
      ]

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
          where('status', '!=', CompanyStatusEnum.DELETED),
          ...constraints,
        ),
        orderBy('row'),
        limit(appConfiguration.listItemsPerPage),
      )

      const countQuery = query(
        coll,
        and(
          where('searchQuery', 'array-contains-any', [
            normalizeText(search) || EMPTY_STRING,
          ]),
          where('status', '!=', CompanyStatusEnum.DELETED),
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

            const companies: Company[] = []

            for (const snap of snapshot.docs) {
              const company: Company = {
                id: snap.id,
                ...snap.data(),
              } as Company

              companies.push(company)
            }

            setResponse({ total, companies })
            setSelectedRows(new Set())
          } catch {
            setResponse({
              total: 0,
              companies: [],
            })
          } finally {
            setIsLoading(false)
          }
        },
        (error) => {
          console.error('Error in realtime listener:', error)
          setResponse({
            total: 0,
            companies: [],
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

  function handleSelectedRow(checked: boolean, companyId: string) {
    setSelectedRows((prevSelected) => {
      const newSelected = new Set(prevSelected)
      if (checked) {
        newSelected.add(companyId)
      } else {
        newSelected.delete(companyId)
      }
      return newSelected
    })
  }

  function handleSelectedAllRows(checked: boolean) {
    if (checked) {
      setSelectedRows(new Set(response.companies.map((company) => company.id)))
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
                response.companies.length > 0 &&
                selectedRows.size === response.companies.length
              }
              onSelectedAllRows={handleSelectedAllRows}
            />
            <TableBody>
              {!isLoading &&
                response.companies.map((company) => (
                  <ListTableRow
                    key={company.id}
                    data={company}
                    isSelected={selectedRows.has(company.id)}
                    onSelectedRow={handleSelectedRow}
                  />
                ))}

              {!isLoading && response.companies.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground p-20"
                  >
                    <Building className="mx-auto mb-4 size-12 text-muted-foreground" />
                    Nenhuma empresa encontrada.
                    <br />
                    Tente ajustar os filtros ou adicionar novas empresas.
                  </TableCell>
                </TableRow>
              )}

              {isLoading && <TableSkeleton quantity={3} />}
            </TableBody>
          </Table>
        </CardContent>

        <ListPaginationSection
          totalCompanies={response.total}
          totalCompaniesShowing={response.companies.length}
        />
      </Card>
    </MotionDiv>
  )
}
