import { MotionDiv } from '@promo/components/framer-motion/motion-div'
import { TaskType } from '@promo/enum/tasks'
import { dayjsApi } from '@promo/lib/dayjs'
import type { Task, Tasting } from '@promo/types/firebase'
import { convertFirebaseDate } from '@promo/utils/date-helpers'
import { Fragment } from 'react'

import { TaskList } from './task-list'
import { TaskNoDayAlert } from './task-no-day-alert'
import { TaskProgress } from './task-progress'
import { TaskTastingInformation } from './task-tasting-information'

interface TastingTasksContentProps {
  tasting: Tasting
}

const tasksMock: Omit<Task, 'tasting'>[] = [
  {
    id: 1,
    title: 'Tarefa 1',
    description: 'Descrição da tarefa 1',
    type: TaskType.SETUP,
    // tasting: tasting,
    status: 'pending',
    category: 'checklist',
    estimatedTime: 160,
    completedAt: undefined,
    completedBy: undefined,
    startedAt: undefined,
    assignedTo: undefined,
    dependencies: [],
    createdAt: new Date(),
    createdBy: '1',
    updatedAt: new Date(),
    updatedBy: '1',
  },
]

export async function TastingTasksContent({
  tasting,
}: TastingTasksContentProps) {
  function isInspectionDay() {
    const today = dayjsApi()
    const startDate = dayjsApi(convertFirebaseDate(tasting.startDate))
    const endDate = dayjsApi(convertFirebaseDate(tasting.endDate))

    return (
      (today.isAfter(startDate, 'day') || today.isSame(startDate, 'day')) &&
      (today.isBefore(endDate, 'day') || today.isSame(endDate, 'day'))
    )
  }

  const canStartTasks = isInspectionDay()
  const completedTasks = tasksMock.filter((task) => task.status === 'completed')
  const inProgressTasks = tasksMock.filter(
    (task) => task.status === 'in_progress',
  )
  const pendingTasks = tasksMock.filter((task) => task.status === 'pending')

  const progressPercentage = Math.round((completedTasks.length / 0) * 100)

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
          totalTasks={0}
          completedTasks={completedTasks.length}
          inProgressTasks={inProgressTasks.length}
          pendingTasks={pendingTasks.length}
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
          tasks={tasksMock as Task[]}
          isEnableToStartTasks={canStartTasks}
        />
      </MotionDiv>
    </Fragment>
  )
}
