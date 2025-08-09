import type { TaskType } from '@promo/enum/tasks'

export enum TaskStatusEnum {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export interface Task {
  id: number
  title: string
  completedAt?: Date
  type: TaskType
  metadata: Record<string, any>
  payload: Record<string, any>
  tasting: string
  package: string
}
