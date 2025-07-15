'use client'

import { MotionDiv } from '@promo/components/framer-motion/motion-div'
import { Badge } from '@promo/components/ui/badge'
import { Button } from '@promo/components/ui/button'
import { Card, CardContent } from '@promo/components/ui/card'
import { Separator } from '@promo/components/ui/separator'
import { dayjsApi } from '@promo/lib/dayjs'
import { cn } from '@promo/lib/utils'
import {
  CheckCircle,
  Circle,
  Clock,
  Lock,
  Pause,
  Play,
  User,
  Users,
} from 'lucide-react'

interface Task {
  id: number
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed'
  category: string
  estimatedTime: string
  completedAt?: Date
  completedBy?: string
  startedAt?: Date
  assignedTo?: string
  dependencies?: number[]
}

interface TaskCardProps {
  task: Task
  canStart: boolean
  allTasks: Task[]
  index: number
}

const categoryColors = {
  preparation:
    'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800',
  verification:
    'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800',
  setup:
    'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800',
  reception:
    'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800',
  execution:
    'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800',
  feedback:
    'bg-pink-50 dark:bg-pink-950/20 border-pink-200 dark:border-pink-800',
  cleanup:
    'bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800',
}

const categoryLabels = {
  preparation: 'Preparação',
  verification: 'Verificação',
  setup: 'Configuração',
  reception: 'Recepção',
  execution: 'Execução',
  feedback: 'Feedback',
  cleanup: 'Finalização',
}

export function TaskCard({ task, canStart, allTasks, index }: TaskCardProps) {
  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return (
          <CheckCircle className="size-5 text-green-600 dark:text-green-400" />
        )
      case 'in_progress':
        return <Clock className="size-5 text-blue-600 dark:text-blue-400" />
      case 'pending':
        return <Circle className="size-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20'
      case 'in_progress':
        return 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20'
      case 'pending':
        return 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/20'
    }
  }

  const getStatusLabel = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'Concluída'
      case 'in_progress':
        return 'Em Andamento'
      case 'pending':
        return 'Pendente'
    }
  }

  const canStartTask = () => {
    if (!canStart) return false
    if (task.status !== 'pending') return false

    // Check if all dependencies are completed
    if (task.dependencies && task.dependencies.length > 0) {
      return task.dependencies.every((depId) => {
        const depTask = allTasks.find((t) => t.id === depId)
        return depTask?.status === 'completed'
      })
    }

    return true
  }

  const getDependencyTasks = () => {
    if (!task.dependencies || task.dependencies.length === 0) return []

    return task.dependencies.map((depId) => {
      const depTask = allTasks.find((t) => t.id === depId)
      return depTask ? depTask.title : `Tarefa ${depId}`
    })
  }

  const isBlocked = task.status === 'pending' && !canStartTask()

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card
        className={cn(
          'transition-all duration-200',
          getStatusColor(task.status),
          isBlocked && 'opacity-60',
          task.status === 'in_progress' &&
            'ring-2 ring-blue-200 dark:ring-blue-800',
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Status Icon */}
            <div className="flex-shrink-0 mt-1">
              {isBlocked ? (
                <Lock className="size-5 text-gray-400" />
              ) : (
                getStatusIcon(task.status)
              )}
            </div>

            {/* Task Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1">
                  <h3 className="font-medium text-base mb-1">{task.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {task.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge
                    variant="secondary"
                    className={cn(
                      'text-xs',
                      categoryColors[
                        task.category as keyof typeof categoryColors
                      ],
                    )}
                  >
                    {
                      categoryLabels[
                        task.category as keyof typeof categoryLabels
                      ]
                    }
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {getStatusLabel(task.status)}
                  </Badge>
                </div>
              </div>

              {/* Task Details */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <Clock className="size-3" />
                  <span>{task.estimatedTime}</span>
                </div>
                {task.assignedTo && (
                  <div className="flex items-center gap-1">
                    <User className="size-3" />
                    <span>{task.assignedTo}</span>
                  </div>
                )}
                {task.completedBy && (
                  <div className="flex items-center gap-1">
                    <Users className="size-3" />
                    <span>Por: {task.completedBy}</span>
                  </div>
                )}
              </div>

              {/* Dependencies */}
              {task.dependencies && task.dependencies.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-muted-foreground mb-1">
                    Depende de:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {getDependencyTasks().map((depTitle, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {depTitle}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              {(task.startedAt || task.completedAt) && (
                <>
                  <Separator className="my-3" />
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {task.startedAt && (
                      <span>
                        Iniciado:{' '}
                        {dayjsApi(task.startedAt).format('DD/MM/YYYY HH:mm')}
                      </span>
                    )}
                    {task.completedAt && (
                      <span>
                        Concluído:{' '}
                        {dayjsApi(task.completedAt).format('DD/MM/YYYY HH:mm')}
                      </span>
                    )}
                  </div>
                </>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 mt-3">
                {task.status === 'pending' && canStartTask() && (
                  <Button size="sm" variant="default">
                    <Play className="size-4 mr-1" />
                    Iniciar
                  </Button>
                )}
                {task.status === 'in_progress' && (
                  <>
                    <Button size="sm" variant="default">
                      <CheckCircle className="size-4 mr-1" />
                      Concluir
                    </Button>
                    <Button size="sm" variant="outline">
                      <Pause className="size-4 mr-1" />
                      Pausar
                    </Button>
                  </>
                )}
                {isBlocked && (
                  <Badge variant="secondary" className="text-xs">
                    <Lock className="size-3 mr-1" />
                    Bloqueada
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </MotionDiv>
  )
}
