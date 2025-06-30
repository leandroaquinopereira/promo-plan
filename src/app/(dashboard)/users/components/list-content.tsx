'use client'

import type { Role, User } from '@promo/@types/firebase'
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
  onSnapshot,
  orderBy,
  query,
  type QueryFilterConstraint,
  type Unsubscribe,
  where,
} from 'firebase/firestore'
import { LoaderPinwheel, UserSearch } from 'lucide-react'
import { parseAsInteger, useQueryState } from 'nuqs'
import { useEffect, useRef, useState, useTransition } from 'react'

import { ListHeaderSection } from './list-header-section'
import { ListPaginationSection } from './list-pagination-section'
import { ListTableHeader } from './list-table-header'
import { ListTableRow } from './list-table-row'

export function ListContent() {
  const [isLoadingUsers, startTransition] = useTransition()
  const unsubscribeRef = useRef<Unsubscribe | null>(null)

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

  const [situation] = useQueryState('situation', {
    defaultValue: 'active',
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
    async function setupRealtimeListener() {
      try {
        // cleaning up previous listener if exists
        if (unsubscribeRef.current) {
          unsubscribeRef.current()
        }

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

        // paginated query
        const q = query(
          coll,
          and(
            where(
              'row',
              '>=',
              (currentPage - 1) * appConfiguration.listItemsPerPage,
            ),
            where('row', '<', currentPage * appConfiguration.listItemsPerPage),
            where('searchQuery', 'array-contains-any', [
              normalizeText(search) || EMPTY_STRING,
            ]),
            ...constraints,
            where('situation', '==', situation),
          ),
          orderBy('row'),
          limit(appConfiguration.listItemsPerPage),
        )

        // counter query (unpaginated)
        const countQuery = query(
          coll,
          and(
            where('searchQuery', 'array-contains-any', [
              normalizeText(search) || EMPTY_STRING,
            ]),
            ...constraints,
            where('situation', '==', situation),
          ),
        )

        const roleCaching = new Map<string, Role>()

        //realtime listener
        unsubscribeRef.current = onSnapshot(
          q,
          async (snapshot) => {
            startTransition(async () => {
              try {
                // getting updated count from server
                const countSnapshot = await getCountFromServer(countQuery)
                const total = countSnapshot.data().count

                // processing snapshot data
                const users: User[] = []
                const roleColl = collection(firestore, Collections.ROLES)

                for (const snap of snapshot.docs) {
                  const user: User = {
                    id: snap.id,
                    ...snap.data(),
                  } as User

                  // getting role reference and fetching role data
                  const roleRefStr = user.role
                  const roleId =
                    typeof roleRefStr === 'string'
                      ? String(roleRefStr).replace('/roles/', '')
                      : roleRefStr.id

                  // check if role is already cached
                  let role: Role | undefined = roleCaching.get(roleId)

                  if (!role) {
                    // if not cached, fetch from Firestore
                    const roleDoc = await getDoc(doc(roleColl, roleId))
                    if (roleDoc.exists()) {
                      role = {
                        id: roleDoc.id,
                        ...roleDoc.data(),
                      } as Role

                      roleCaching.set(roleId, role)
                    }
                  }

                  user.role = role

                  if (user.lastLoggedAt) {
                    user.lastLoggedAt = user.lastLoggedAt.toDate()
                  }

                  users.push(user)
                }

                setResponse({
                  total,
                  users,
                })
              } catch (error) {
                console.error('Error processing realtime update:', error)
                // Do not set response to empty here, keep previous state
                // setResponse({
                //   total: 0,
                //   users: [],
                // })
              }
            })
          },
          (error) => {
            console.error('Error in realtime listener:', error)
            // Do not set response to empty here, keep previous state
            // setResponse({
            //   total: 0,
            //   users: [],
            // })
          },
        )
      } catch (error) {
        console.error('Error setting up realtime listener:', error)
        setResponse({
          total: 0,
          users: [],
        })
      }
    }

    setupRealtimeListener()

    // cleaning up the listener on component unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
    }
  }, [search, state, permission, status, currentPage, situation])

  // cleaning up the listener on component unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [])

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="p-4">
        <ListHeaderSection
          totalUsers={response?.total || 0}
          onlineUsers={0}
          workingUsers={0}
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
