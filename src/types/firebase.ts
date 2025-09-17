import type { CompanyStatusEnum } from '@promo/enum/company-status'
import type { ProductStatusEnum } from '@promo/enum/product-status'
import type { TaskType } from '@promo/enum/tasks'
import type { UserSituationEnum } from '@promo/enum/user-situation'
import type { UserStatusEnum } from '@promo/enum/user-status'
import type { DocumentReference, Timestamp } from 'firebase/firestore'

export type VerificationCode = {
  sentAt: Timestamp
  phone: string
  code: string
  verified: boolean
  verifiedAt: string
  tries: number
  expired?: boolean
  expiredAt?: Timestamp
  smsSnsResponse: {
    MessageId: string
    Message: string
    PhoneNumber: string
    Subject: string
    MessageAttributes: Record<string, any>
    metadata: string
  }
}

export type GuideCategory =
  | 'checklist'
  | 'reports'
  | 'photo_evidences'
  | 'setup'
  | 'best_practices'

export interface Guide {
  id: string
  title: string
  description: string
  category: GuideCategory
  lastUpdated: string
  content?: string
  updatedAt: Timestamp | Date
}

export type Role = {
  id: string
  name: string
  slug: string
  createdAt: number
}

export interface User {
  id: string
  name: string
  phone: string
  password: string
  email?: string
  role: {
    id: string
    name: string
    slug: string
  }
  active: boolean
  state: string
  city: string
  createdAt: number
  updatedAt: number
  createdBy: string
  updatedBy: string
  lastLoggedAt: number
  avatar?: string
  situation: UserSituationEnum
  status: UserStatusEnum
}

export interface Company {
  id: string
  name: string
  status: CompanyStatusEnum
  createdAt: number
  updatedAt: number
  createdBy: string
  updatedBy: string
}

export interface Product {
  id: string
  name: string
  description: string
  status: ProductStatusEnum
  createdAt: number
  updatedAt: number
  createdBy: string
  updatedBy: string
}

export type TastingStatus =
  | 'draft'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'deleted'
  | 'todo'
  | 'in_progress'

export type ProductTasting = Product | DocumentReference

export interface Tasting {
  id: number
  promoter: User | DocumentReference
  row: number
  city: string
  startDate: Timestamp | Date
  endDate: Timestamp | Date
  company: Company | DocumentReference
  products: ProductTasting[]
  notes?: string
  status: TastingStatus
  createdAt: Timestamp | Date
  updatedAt: Timestamp | Date
  createdBy: string
  updatedBy: string
}

export interface TastingLog {
  id: string
  tasting: Tasting | DocumentReference
  status: TastingStatus
  createdAt: Timestamp | Date
  createdBy: string
}

export interface Task {
  id: number
  title: string
  description: string
  type: TaskType
  tasting: Tasting | DocumentReference
  status: 'pending' | 'in_progress' | 'completed'
  category: string
  estimatedTime: number
  completedAt?: Timestamp | Date
  completedBy?: string
  startedAt?: Timestamp | Date
  assignedTo?: string
  dependencies?: number[]
  createdAt: Timestamp | Date
  createdBy: string
  updatedAt: Timestamp | Date
  updatedBy: string
}
