'use client'

import type { User } from '@promo/@types/firebase'
import { Collections } from '@promo/collections'
import { MotionDiv } from '@promo/components/framer-motion/motion-div'
import { Card, CardContent } from '@promo/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@promo/components/ui/table'
import { appConfiguration } from '@promo/constants/app-configuration'
import { mockUsers } from '@promo/constants/mocks'
import { firestore } from '@promo/lib/firebase/client'
import { EMPTY_STRING } from '@promo/utils/generates-substrings-to-query-search'
import { normalizeText } from '@promo/utils/normalize-text'
import {
  and,
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  type QueryFilterConstraint,
  where,
} from 'firebase/firestore'
import { LoaderPinwheel, UserSearch } from 'lucide-react'
import { parseAsInteger, useQueryState } from 'nuqs'
import { useEffect, useState, useTransition } from 'react'

import { ListHeaderSection } from './list-header-section'
import { ListPaginationSection } from './list-pagination-section'
import { ListTableHeader } from './list-table-header'
import { ListTableRow } from './list-table-row'

const totalUsers = mockUsers.length
const onlineUsers = mockUsers.filter((user) => user.isOnline).length
const workingUsers = mockUsers.filter((user) => user.isWorking).length

export function ListContent() {
  const [isLoadingUsers, startTransition] = useTransition()

  const [search] = useQueryState('search', {
    defaultValue: '',
  })

  const [state] = useQueryState('state', {
    defaultValue: 'all',
  })

  const [permission] = useQueryState('permission', {
    defaultValue: 'all',
  })

  const [status] = useQueryState('status', {
    defaultValue: 'all',
  })

  const [currentPage] = useQueryState(
    'current-page',
    parseAsInteger.withDefault(1),
  )

  const [response, setResponse] = useState<{
    total: number
    users: User[]
  }>({
    total: 0,
    users: [],
  })

  useEffect(() => {
    async function fetchFn() {
      try {
        const coll = collection(firestore, Collections.USERS)
        const constraints: QueryFilterConstraint[] = []
        if (state !== 'all') {
          constraints.push(where('state', '==', state))
        }

        if (permission !== 'all') {
          const permissions = await getDocs(
            collection(firestore, Collections.ROLES),
          )

          const permissionDoc = permissions.docs.find(
            (doc) => doc.data().slug === permission,
          )

          if (permissionDoc) {
            constraints.push(where('role', '==', permissionDoc.ref))
          }
        }

        if (status !== 'all') {
          constraints.push(where('status', '==', status))
        }

        const q = query(
          coll,
          and(
            where('row', '>=', (currentPage - 1) * 10),
            where('searchQuery', 'array-contains-any', [
              normalizeText(search) || EMPTY_STRING,
            ]),
            ...constraints,
            where('active', '==', true),
          ),
          orderBy('row'),
          limit(appConfiguration.listItemsPerPage),
        )

        const count = await getCountFromServer(
          query(
            coll,
            and(
              where('searchQuery', 'array-contains-any', [
                normalizeText(search) || EMPTY_STRING,
              ]),
              ...constraints,
              where('active', '==', true),
            ),
          ),
        )

        const snapshot = await getDocs(q)
        const users = []

        const roleColl = collection(firestore, Collections.ROLES)
        let user: User
        for await (const snap of snapshot.docs) {
          user = {
            id: snap.id,
            ...snap.data(),
          } as User

          const roleRefStr = user.role
          const roleId =
            typeof roleRefStr === 'string'
              ? String(roleRefStr).replace('/roles/', '')
              : roleRefStr.id

          const roleRef = doc(roleColl, roleId)
          const role = await getDoc(roleRef)

          user.role = {
            id: role.id,
            ...role.data(),
          }

          user.lastLoggedAt = user.lastLoggedAt?.toDate()

          users.push(user)
        }

        setResponse({
          total: count.data().count,
          users,
        })
      } catch (error) {
        console.error('Error fetching users:', error)
        setResponse({
          total: 0,
          users: [],
        })
      }
    }

    startTransition(fetchFn)
  }, [search, state, permission, status, currentPage])

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="p-4">
        <ListHeaderSection
          totalUsers={response?.total || 0}
          onlineUsers={onlineUsers}
          workingUsers={workingUsers}
        />
        <CardContent className="p-0 m-0">
          <Table>
            <ListTableHeader />
            <TableBody>
              {!isLoadingUsers &&
                response?.users.map((user) => (
                  <ListTableRow data={user} key={user.id} />
                ))}

              {!isLoadingUsers && response.total === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center text-muted-foreground p-20"
                  >
                    <UserSearch className="mx-auto mb-4 size-12 text-muted-foreground" />
                    Nenhum usuário encontrado.
                    <br />
                    Tente ajustar os filtros ou adicionar novos usuários.
                  </TableCell>
                </TableRow>
              )}

              {isLoadingUsers && (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center text-muted-foreground p-20"
                  >
                    <LoaderPinwheel className="mx-auto mb-4 size-8 text-muted-foreground animate-spin" />
                    Carregando usuários...
                    <br />
                    Aguarde enquanto os usuários são carregados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>

        {/* Pagination */}
        <ListPaginationSection
          totalUsers={response.total || 0}
          totalUsersShowing={response.users.length || 0}
        />
      </Card>
    </MotionDiv>
  )
}
