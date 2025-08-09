import type { Company } from './company'
import type { Product } from './product'
import type { User } from './user'

export enum TastingStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DELETED = 'deleted',
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
}

export interface Tasting {
  id: number
  promoter: User
  startDate: Date
  endDate: Date
  company: Company
  products: Product[]
  notes?: string
  status: TastingStatus
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
}
