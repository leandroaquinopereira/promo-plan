'use client'

import { Badge } from '@promo/components/ui/badge'
import { Button } from '@promo/components/ui/button'
import { TableCell, TableRow } from '@promo/components/ui/table'
import { Muted } from '@promo/components/ui/typography'
import { dayjsApi } from '@promo/lib/dayjs'
import { cn } from '@promo/lib/utils'
import type { Task } from '@promo/types/models/task'
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react'
import Link from 'next/link'

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

interface ListPackageRowProps {
  pack: Package
  isExpanded?: boolean
  onToggleExpansion?: () => void
}

const taskStatusColors = {
  completed: 'bg-green-500/10 text-green-600 border-green-500/20',
  in_progress: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
}

const taskStatusLabels = {
  completed: 'Completo',
  in_progress: 'Em andamento',
  pending: 'Pendente',
}

export function ListPackageRow({
  pack,
  isExpanded,
  onToggleExpansion,
}: ListPackageRowProps) {
  const now = dayjsApi().format('YYYYMMDD')
  const friendlyId = pack.id.split('_').at(-1)

  function getTaskStatus() {
    const completedTasks = pack.tasks.filter((task) => task.completedAt)
    const pendingTasks = pack.tasks.filter((task) => !task.completedAt)

    if (completedTasks.length === pack.tasks.length) {
      return 'completed'
    }

    if (pendingTasks.length < pack.tasks.length) {
      return 'in_progress'
    }

    return 'pending'
  }

  return (
    <TableRow className={cn(now !== friendlyId && 'opacity-50')}>
      <TableCell>
        <Button
          variant="outline"
          size="icon"
          disabled={now !== friendlyId}
          className="size-6 transition-all duration-200"
          onClick={onToggleExpansion}
        >
          <div
            className={cn(
              'transition-transform duration-200',
              isExpanded && 'rotate-90',
            )}
          >
            <ChevronRightIcon className="size-4" />
          </div>
        </Button>
      </TableCell>
      <TableCell>
        {friendlyId}-{pack.tastingRow}
      </TableCell>
      <TableCell>
        Pacote #{friendlyId} - {pack.tasks[0]?.tastingName}
      </TableCell>
      <TableCell>{pack.tasks.length} tarefas</TableCell>
      <TableCell>
        <Badge className={cn(taskStatusColors[getTaskStatus()])}>
          {taskStatusLabels[getTaskStatus()]}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          <Link
            href={`/tastings/${pack.tasks[0]?.tastingId}/detail`}
            className="text-sm font-medium underline hover:underline text-blue-300 dark:text-blue-500 hover:text-blue-400 dark:hover:text-blue-600"
          >
            {pack.tasks[0]?.tastingName}
          </Link>
        </div>
      </TableCell>
      <TableCell>
        <Muted>{pack.tasks[0]?.companyName}</Muted>
      </TableCell>
    </TableRow>
  )
}
