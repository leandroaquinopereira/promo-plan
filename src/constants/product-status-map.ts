import type { ProductStatus } from '@promo/@types/firebase'

export const productStatusMap: Record<ProductStatus, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  deleted: 'Deletado',
}
