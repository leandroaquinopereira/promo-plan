import { TaskType } from '@promo/enum/tasks'
import type { Task } from '@promo/types/models/task'

export function buildTasks(tastingId: string, packageId: string): Task[] {
  return [
    {
      id: 1,
      title: 'Foto de chegada ao local do evento',
      type: TaskType.SETUP,
      metadata: {},
      payload: {},
      tasting: tastingId,
      package: packageId,
    },
    {
      id: 2,
      title: 'Relatório de chegada ao local do evento',
      type: TaskType.CHECKLIST,
      metadata: {},
      payload: {},
      tasting: tastingId,
      package: packageId,
    },
    {
      id: 3,
      title: 'Foto com o balcão montado',
      type: TaskType.PHOTO_EVIDENCES,
      metadata: {},
      payload: {},
      tasting: tastingId,
      package: packageId,
    },
    {
      id: 4,
      title: 'Foto do final do dia',
      type: TaskType.PHOTO_EVIDENCES,
      metadata: {},
      payload: {},
      tasting: tastingId,
      package: packageId,
    },
  ]
}
