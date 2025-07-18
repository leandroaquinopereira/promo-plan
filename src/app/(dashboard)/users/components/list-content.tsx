'use client'

import type { Role, User } from '@promo/types/firebase'
import { deleteUserBatchAction } from '@promo/actions/delete-user-batch'
import { disableUserBatchAction } from '@promo/actions/disable-user-batch'
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
import { EventStatusEnum } from '@promo/enum/event-status'
import { UserStatusEnum } from '@promo/enum/user-status'
import { usersListEvents } from '@promo/events/users-list'
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
import { UserSearch } from 'lucide-react'
import { parseAsInteger, useQueryState } from 'nuqs'
import { useEffect, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'

import { ListHeaderSection } from './list-header-section'
import { ListPaginationSection } from './list-pagination-section'
import { ListTableHeader } from './list-table-header'
import { ListTableRow } from './list-table-row'

export function ListContent() {
  const { execute } = useServerAction(deleteUserBatchAction)
  const { execute: disableUserBatch } = useServerAction(disableUserBatchAction)
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

  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())

  function handleSelectedRow(checked: boolean, userId: string) {
    setSelectedRows((prevSelected) => {
      if (checked) {
        prevSelected.add(userId)
      } else {
        prevSelected.delete(userId)
      }

      return new Set(prevSelected)
    })
  }

  function handleDeleteSelectedRows() {
    try {
      const hasActiveUsersOnSelectedRows = response.users.some(
        (user) => user.situation === 'active' && selectedRows.has(user.id),
      )

      if (hasActiveUsersOnSelectedRows) {
        toast.error(
          'Não é possível deletar usuários ativos. Desabilite-os primeiro.',
        )
        return
      }

      toast.promise(
        execute({
          users: Array.from(selectedRows),
        }),
        {
          loading: 'Deletando usuários...',
          success: (result) => {
            if (!result || typeof result !== 'object') {
              throw new Error('Resposta inválida do servidor')
            }

            if ('error' in result && result.error) {
              throw new Error(
                // @ts-expect-error ignore error type for now
                result.error?.message || 'Erro ao deletar usuários',
              )
            }

            if ('success' in result && !result.success) {
              throw new Error('Falha ao deletar usuário')
            }

            setSelectedRows(new Set()) // Clear selected rows after disabling
            return 'Usuários deletados com sucesso.'
          },
          error: (error) => {
            if (error instanceof Error) {
              return error.message
            }

            return 'Erro ao deletar usuários.'
          },
        },
      )
    } catch (error) {
      console.error('Unexpected error:', error)
    }
  }

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

                  const eventsInProgressCount = query(
                    collection(firestore, Collections.EVENTS),
                    and(
                      where(
                        'responsible',
                        '==',
                        doc(firestore, Collections.USERS, user.id),
                      ),
                      where('status', '==', EventStatusEnum.IN_PROGRESS),
                    ),
                  )

                  const eventsInProgressSnapshot = await getCountFromServer(
                    eventsInProgressCount,
                  )

                  const isWorking = eventsInProgressSnapshot.data().count > 0
                  if (isWorking) {
                    user.status = UserStatusEnum.WORKING
                  }

                  users.push(user)
                }

                setResponse({
                  total,
                  users,
                })

                setSelectedRows(new Set())
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

  useEffect(() => {
    function handleDisableAllUsersSelected() {
      try {
        toast.promise(
          disableUserBatch({
            users: Array.from(selectedRows),
          }),
          {
            loading: 'Deletando usuários...',
            success: (result) => {
              if (!result || typeof result !== 'object') {
                throw new Error('Resposta inválida do servidor')
              }

              if ('error' in result && result.error) {
                throw new Error(
                  // @ts-expect-error ignore error type for now
                  result.error?.message || 'Erro ao desabilitar usuários',
                )
              }

              if ('success' in result && !result.success) {
                throw new Error('Falha ao desabilitar usuário')
              }

              setSelectedRows(new Set()) // Clear selected rows after disabling
              return 'Usuários desabilitados com sucesso.'
            },
            error: (error) => {
              if (error instanceof Error) {
                return error.message
              }

              return 'Erro ao desabilitar usuários.'
            },
          },
        )
      } catch (error) {
        console.error('Unexpected error:', error)
      }
    }

    window.addEventListener(
      usersListEvents.disableAllEvents,
      handleDisableAllUsersSelected,
    )

    return () => {
      window.removeEventListener(
        usersListEvents.disableAllEvents,
        handleDisableAllUsersSelected,
      )
    }
  }, [disableUserBatch, selectedRows])

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="p-4">
        <ListHeaderSection
          totalUsers={response?.total || 0}
          onDeleteSelected={handleDeleteSelectedRows}
        />
        <CardContent className="p-0 m-0">
          <Table>
            <ListTableHeader
              isAllSelected={
                response.users.length > 0 &&
                response.users.length === selectedRows.size
              }
              onSelectedAllRows={(checked) => {
                if (checked) {
                  const allUserIds = new Set(
                    response.users.map((user) => user.id),
                  )
                  setSelectedRows(allUserIds)
                } else {
                  setSelectedRows(new Set())
                }
              }}
            />
            <TableBody>
              {!isLoadingUsers &&
                response?.users.map((user) => (
                  <ListTableRow
                    onSelectedRow={handleSelectedRow}
                    isSelected={selectedRows.has(user.id)}
                    data={user}
                    key={user.id}
                  />
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

              {isLoadingUsers && <TableSkeleton quantity={7} />}
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
