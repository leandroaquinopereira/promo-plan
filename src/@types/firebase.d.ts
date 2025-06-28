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
