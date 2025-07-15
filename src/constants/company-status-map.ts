import type { CompanyStatus } from '@promo/@types/firebase'

export const companyStatusMap: Record<CompanyStatus, string> = {
  active: 'Ativa',
  inactive: 'Inativa',
}
