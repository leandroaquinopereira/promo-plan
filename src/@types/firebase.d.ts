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

export type TastingStatus =
  | 'draft'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'postponed'

export interface Tasting {
  id: string
  processId: number
  promoterId: string
  promoter: User | firestore.DocumentReference
  startDate: firestore.Timestamp
  endDate: firestore.Timestamp
  company: string
  city: string
  state: string
  products: string[]
  notes: string
  status: TastingStatus
  createdAt: firestore.Timestamp
  updatedAt: firestore.Timestamp
  createdBy: string
  updatedBy: string
  evidences?: {
    id: string
    name: string
    url: string
    type: 'image' | 'document' | 'video'
    uploadedAt: firestore.Timestamp
  }[]
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
