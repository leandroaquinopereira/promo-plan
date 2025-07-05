import type { CompanyStatus } from '@promo/@types/firebase'

export const companyStatusColors: Record<CompanyStatus, string> = {
  active: 'bg-green-500/10 text-green-600 border-green-500/20',
  inactive: 'bg-red-500/10 text-red-600 border-red-500/20',
}
