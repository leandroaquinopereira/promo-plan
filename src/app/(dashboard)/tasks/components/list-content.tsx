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
import { dayjsApi } from '@promo/lib/dayjs'
import { firestore } from '@promo/lib/firebase/client'
import type { Task } from '@promo/types/models/task'
import { convertFirebaseDate } from '@promo/utils/date-helpers'
import {
  and,
  collection,
  doc,
  doc as documentFirestore,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  type QueryFilterConstraint,
  type Unsubscribe,
  where,
} from 'firebase/firestore'
import { PackageIcon } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { parseAsString, useQueryState } from 'nuqs'
import { useEffect, useRef, useState } from 'react'

import { Filter } from './filter'
import { ListPackageRow } from './list-package-row'
import { ListPaginationSection } from './list-pagination-section'
import { ListTableHeader } from './list-table-header'
import { ListTableRow } from './list-table-row'

interface TaskWithTasting extends Task {
  tastingName?: string
  companyName?: string
  tastingId?: string
}

interface Package {
  id: string
  tasks: TaskWithTasting[]
  tastingRow: number
}

export function ListContent() {
  const [isLoading, setIsLoading] = useState(true)
  const [tasks, setTasks] = useState<TaskWithTasting[]>([])
  const [packages, setPackages] = useState<Package[]>([])
  const [expandedPackages, setExpandedPackages] = useState<Set<string>>(
    new Set(),
  )

  const [search] = useQueryState('search', parseAsString.withDefault(''))

  const session = useSession()

  const unsubscribeRef = useRef<Unsubscribe | null>(null)

  function canStartTask(pack: Package, task: Task) {
    const beforeTaskIndex = pack.tasks.findIndex((t) => t.id === task.id)
    const now = dayjsApi().format('YYYYMMDD')
    const dayOfPackage = pack.id.split('_').at(-1)
    if (now !== dayOfPackage) {
      return false
    }

    if (beforeTaskIndex === -1 || beforeTaskIndex === 0) {
      return true
    }

    const beforeTask = pack.tasks[beforeTaskIndex - 1]
    return !!beforeTask?.completedAt
  }

  function togglePackageExpansion(packageId: string) {
    setExpandedPackages((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(packageId)) {
        newSet.delete(packageId)
      } else {
        newSet.add(packageId)
      }
      return newSet
    })
  }

  useEffect(() => {
    async function setup() {
      if (!session.data?.user.id) {
        return
      }

      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }

      try {
        const constraints: QueryFilterConstraint[] = []

        if (search && Number.isInteger(parseInt(search))) {
          constraints.push(where('row', '==', parseInt(search)))
        }

        const tastingsQuery = query(
          collection(firestore, Collections.TASTINGS),
          // where('promoter', '==', 'users/35998207796'),
          and(
            where(
              'promoter',
              '==',
              doc(
                collection(firestore, Collections.USERS),
                session.data?.user.id,
              ),
            ),
            ...constraints,
          ),
        )

        unsubscribeRef.current = onSnapshot(
          tastingsQuery,
          async (snapshot) => {
            try {
              const packagesData: Package[] = []
              const companyCache = new Map<string, any>()

              for (const doc of snapshot.docs) {
                const tastingData = doc.data()
                // const tasks = await getDocs(
                //   collection(packageSnapshot.ref, Collections.TASKS),
                // )

                let companyName = ''
                if (tastingData?.company) {
                  const companyId =
                    typeof tastingData.company === 'string'
                      ? tastingData.company.replace('/companies/', '')
                      : tastingData.company.id

                  let companyData = companyCache.get(companyId)
                  if (!companyData) {
                    try {
                      const coll = collection(firestore, Collections.COMPANIES)

                      const companyDoc = await getDoc(
                        documentFirestore(coll, companyId),
                      )

                      if (companyDoc.exists()) {
                        companyData = companyDoc.data()
                        companyCache.set(companyId, companyData)
                      }
                    } catch (error) {
                      console.error('Error fetching company:', error)
                    }
                  }
                  companyName = companyData?.name || ''
                }

                const packageQuery = collection(
                  doc.ref,
                  Collections.TASK_PACKAGES,
                )

                const packageSnapshot = await getDocs(packageQuery)
                for (const packageDoc of packageSnapshot.docs) {
                  const tasksData: TaskWithTasting[] = []
                  const tasks = await getDocs(
                    collection(packageDoc.ref, Collections.TASKS),
                  )

                  for (const task of tasks.docs) {
                    const taskData = task.data()

                    const taskWithTasting: TaskWithTasting = {
                      id: parseInt(task.id) || 0,
                      title: taskData.title || '',
                      completedAt: taskData.completedAt
                        ? convertFirebaseDate(taskData.completedAt)
                        : undefined,
                      type: taskData.type,
                      metadata: taskData.metadata || {},
                      payload: taskData.payload || {},
                      tasting: doc.id,
                      package: packageDoc.id, // packageId
                      tastingName:
                        tastingData?.name || `Degustação #${tastingData?.row}`,
                      companyName,
                      tastingId: doc.id,
                    }

                    tasksData.push(taskWithTasting)
                  }

                  tasksData.sort((a, b) => a.id - b.id)
                  packagesData.push({
                    id: packageDoc.id,
                    tasks: tasksData,
                    tastingRow: tastingData?.row,
                  })
                }
              }

              // Ordenar por ID da tarefa

              packagesData.sort((a, b) => a.tastingRow - b.tastingRow)

              setPackages(packagesData)
              setIsLoading(false)
            } catch (error) {
              console.error('Error processing tasks:', error)
              setPackages([])
              setIsLoading(false)
            }
          },
          (error) => {
            console.error('Error fetching tasks:', error)
            setPackages([])
            setIsLoading(false)
          },
        )
      } catch (error) {
        console.error('Error setting up tasks listener:', error)
        setIsLoading(false)
      }
    }

    setup()

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
    }
  }, [search, session.data?.user.id])

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Filter />
      <Card className="px-4">
        <CardContent className="p-0">
          <Table>
            <ListTableHeader />
            <TableBody>
              {!isLoading &&
                packages.map((pack) => {
                  const isExpanded = expandedPackages.has(pack.id)
                  return (
                    <>
                      <ListPackageRow
                        key={pack.id}
                        pack={pack}
                        isExpanded={isExpanded}
                        onToggleExpansion={() =>
                          togglePackageExpansion(pack.id)
                        }
                      />
                      {isExpanded && (
                        <>
                          <TableRow className="bg-muted/20 border-t">
                            <TableCell className="pl-12 font-medium text-sm text-muted-foreground">
                              ID
                            </TableCell>
                            <TableCell className="font-medium text-sm text-muted-foreground">
                              Título
                            </TableCell>
                            <TableCell className="font-medium text-sm text-muted-foreground">
                              Tipo
                            </TableCell>
                            <TableCell className="font-medium text-sm text-muted-foreground">
                              Status
                            </TableCell>
                            <TableCell className="font-medium text-sm text-muted-foreground">
                              Degustação
                            </TableCell>
                            <TableCell className="font-medium text-sm text-muted-foreground">
                              Empresa
                            </TableCell>
                            <TableCell className="font-medium text-sm text-muted-foreground">
                              Ações
                            </TableCell>
                          </TableRow>
                          {pack.tasks.map((task) => (
                            <ListTableRow
                              key={`${pack.id}-${task.id}`}
                              data={task}
                              canStartTask={(task) => canStartTask(pack, task)}
                              isSubRow={true}
                            />
                          ))}
                        </>
                      )}
                    </>
                  )
                })}

              {!isLoading && packages.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground p-20"
                  >
                    <PackageIcon className="mx-auto mb-4 size-12 text-muted-foreground" />
                    Nenhuma tarefa encontrada.
                    <br />
                    As tarefas são criadas automaticamente quando uma degustação
                    é iniciada.
                  </TableCell>
                </TableRow>
              )}

              {isLoading && <TableSkeleton quantity={8} />}
            </TableBody>
          </Table>
        </CardContent>

        <ListPaginationSection
          totalTasks={tasks.length}
          totalTasksShowing={tasks.length}
        />
      </Card>
    </MotionDiv>
  )
}
