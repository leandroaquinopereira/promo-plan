import type { TastingStatus } from '@promo/types/firebase'

export const tastingStatusColors: Record<TastingStatus, string> = {
  draft: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
  active: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  completed: 'bg-green-500/10 text-green-600 border-green-500/20',
  cancelled: 'bg-red-500/10 text-red-600 border-red-500/20',
  deleted: 'bg-red-500/10 text-red-600 border-red-500/20',
  todo: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  in_progress: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
}
