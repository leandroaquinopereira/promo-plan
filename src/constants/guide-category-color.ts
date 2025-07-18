import type { GuideCategory } from '@promo/types/firebase'

export const guideCategoryColors: Record<GuideCategory, string> = {
  checklist: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  reports: 'bg-green-500/10 text-green-500 border-green-500/20',
  photo_evidences: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  setup: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  best_practices: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
}
