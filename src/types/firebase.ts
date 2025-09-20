import type { CompanyStatusEnum } from '@promo/enum/company-status'
import type { ProductStatusEnum } from '@promo/enum/product-status'
import type { TaskType } from '@promo/enum/tasks'
import type { TastingStatusEnum } from '@promo/enum/tasting-status'
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
  roleId: string
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

export type ProductTasting = {
  id: string
  name: string
  quantity: number
}

export interface Tasting {
  id: string
  promoterId: string
  promoter: {
    id: string
    name: string
    email: string
  }
  row: number
  city: string
  startDate: number
  endDate: number
  companyId: string
  company: {
    id: string
    name: string
  }
  products: ProductTasting[]
  notes?: string
  status: TastingStatusEnum
  createdAt: number
  updatedAt: number
  createdBy: string
  updatedBy: string
}

export interface TastingLog {
  id: string
  tastingId: string
  tasting: {
    id: string
    row: number
  }
  status: TastingStatusEnum
  createdAt: number
  createdBy: string
}

export interface Task {
  id: number
  title: string
  description: string
  type: TaskType
  tastingId: string
  tasting: {
    id: string
    row: number
  }
  status: 'pending' | 'in_progress' | 'completed'
  category: string
  estimatedTime: number
  completedAt?: number
  completedBy?: string
  startedAt?: number
  assignedTo?: string
  dependencies?: number[]
  createdAt: number
  createdBy: string
  updatedAt: number
  updatedBy: string
}
