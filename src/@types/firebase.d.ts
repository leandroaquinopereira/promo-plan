export type VerificationCode = {
  sentAt: firestore.Timestamp
  phone: string
  code: string
  verified: boolean
  verifiedAt: string
  tries: number
  expired?: boolean
  expiredAt?: firestore.Timestamp
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
  updatedAt: firestore.Timestamp
}

export type Role = {
  id: string
  name: string
  slug: string
  createdAt: firestore.Timestamp
}

export type UserSituation = 'active' | 'inactive' | 'deleted'
export type UserStatus = 'online' | 'offline' | 'working'

export interface User {
  id: string
  name: string
  phone: string
  password: string
  email?: string
  role: Role | firestore.DocumentReference
  active: boolean
  state: string
  city: string
  createdAt: firestore.Timestamp
  updatedAt: firestore.Timestamp
  createdBy: string
  updatedBy: string
  lastLoggedAt: firestore.Timestamp
  avatar?: string
  situation: UserSituation
  status: UserStatus
}

export type CompanyStatus = 'active' | 'inactive'

export interface Company {
  id: string
  name: string
  status: CompanyStatus
  createdAt: firestore.Timestamp
  updatedAt: firestore.Timestamp
  createdBy: string
  updatedBy: string
}

export type ProductStatus = 'active' | 'inactive' | 'deleted'

export interface Product {
  id: string
  name: string
  description: string
  status: ProductStatus
  createdAt: firestore.Timestamp
  updatedAt: firestore.Timestamp
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

export type ProductTasting = Product | firestore.DocumentReference

export interface Tasting {
  id: number
  promoter: User | firestore.DocumentReference
  startDate: firestore.Timestamp
  endDate: firestore.Timestamp
  company: Company | firestore.DocumentReference
  products: ProductTasting[]
  notes?: string
  status: TastingStatus
  createdAt: firestore.Timestamp
  updatedAt: firestore.Timestamp
  createdBy: string
  updatedBy: string
}

export interface TastingLog {
  id: string
  tasting: Tasting | firestore.DocumentReference
  status: TastingStatus
  createdAt: firestore.Timestamp
  createdBy: string
}
