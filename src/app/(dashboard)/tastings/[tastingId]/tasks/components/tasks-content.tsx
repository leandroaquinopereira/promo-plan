'use client'

import { MotionDiv } from '@promo/components/framer-motion/motion-div'
import { dayjsApi } from '@promo/lib/dayjs'
import type { Product } from '@promo/types/models/product'
import { type Task } from '@promo/types/models/task'
import { Fragment } from 'react'

import { TaskList } from './task-list'
import { TaskNoDayAlert } from './task-no-day-alert'
import { TaskProgress } from './task-progress'
import { TaskTastingInformation } from './task-tasting-information'

interface TastingTasksContentProps {
  tasting: {
    promoter: {
      name: string
      phone: string
      city: string
      state: string
    }
    company: {
      name: string
    }
    startDate: string
    endDate: string
    products: Product[]
    tasks: Task[]
  }
  // tasks: Task[]
}

const tasksMock: Omit<Task, 'tasting'>[] = []

export function TastingTasksContent({
  tasting,
  // tasks,
}: TastingTasksContentProps) {
  function isInspectionDay() {
    const today = dayjsApi()
    const startDate = dayjsApi(tasting.startDate)
    const endDate = dayjsApi(tasting.endDate)

    return (
      (today.isAfter(startDate, 'day') || today.isSame(startDate, 'day')) &&
      (today.isBefore(endDate, 'day') || today.isSame(endDate, 'day'))
    )
  }

  function canStartTask(task: Task) {
    const beforeTaskIndex = tasting.tasks.findIndex((t) => t.id === task.id)

    if (beforeTaskIndex === -1 || beforeTaskIndex === 0) {
      return true
    }

    const beforeTask = tasting.tasks[beforeTaskIndex - 1]
    return !!beforeTask?.completedAt
  }

  const canStartTasks = isInspectionDay()
  const completedTasks = tasting.tasks.filter((task) => task.completedAt)
  const inProgressTasks = tasting.tasks.filter((task) => !task.completedAt)

  const progressPercentage = Math.round(
    (completedTasks.length / tasting.tasks.length) * 100,
  )

  return (
    <Fragment>
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <TaskTastingInformation tasting={tasting} />
      </MotionDiv>

      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <TaskProgress
          totalTasks={tasting.tasks.length}
          completedTasks={completedTasks.length}
          inProgressTasks={inProgressTasks.length}
          pendingTasks={0}
          progressPercentage={progressPercentage}
        />
      </MotionDiv>

      {!canStartTasks && <TaskNoDayAlert tasting={tasting} />}

      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <TaskList
          tasks={tasting.tasks}
          isEnableToStartTasks={canStartTasks}
          canStartTask={canStartTask}
        />
      </MotionDiv>
    </Fragment>
  )
}
