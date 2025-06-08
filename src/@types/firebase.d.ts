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
