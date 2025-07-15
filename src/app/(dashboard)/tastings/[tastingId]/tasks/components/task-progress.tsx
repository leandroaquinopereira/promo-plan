'use client'

import { Badge } from '@promo/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@promo/components/ui/card'
import { Progress } from '@promo/components/ui/progress'
import { CheckCircle, Circle, Clock, TrendingUp } from 'lucide-react'

interface TaskProgressProps {
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  pendingTasks: number
  progressPercentage: number
}

export function TaskProgress({
  totalTasks,
  completedTasks,
  inProgressTasks,
  pendingTasks,
  progressPercentage,
}: TaskProgressProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="size-5" />
          Progresso das Tarefas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progresso Geral</span>
              <span className="text-sm text-muted-foreground">
                {progressPercentage}% completo
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <CheckCircle className="size-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Concluídas
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {completedTasks}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Clock className="size-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Em Andamento
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {inProgressTasks}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-950/20 border border-gray-200 dark:border-gray-800">
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                <Circle className="size-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Pendentes
                </p>
                <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {pendingTasks}
                </p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium">Total de Tarefas</span>
            <Badge variant="outline" className="font-bold">
              {totalTasks}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
