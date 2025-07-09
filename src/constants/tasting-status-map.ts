import type { TastingStatus } from '@promo/@types/firebase'

export const tastingStatusMap: Record<TastingStatus, string> = {
  draft: 'Rascunho',
  active: 'Ativo',
  completed: 'Concluído',
  cancelled: 'Cancelado',
  deleted: 'Excluído',
  todo: 'A fazer',
  in_progress: 'Em andamento',
}
