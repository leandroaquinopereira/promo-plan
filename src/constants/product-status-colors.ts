import type { ProductStatus } from '@promo/@types/firebase'

export const productStatusColors: Record<ProductStatus, string> = {
  active: 'bg-green-500/10 text-green-600 border-green-500/20',
  inactive: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  deleted: 'bg-red-500/10 text-red-600 border-red-500/20',
}
