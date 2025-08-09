export type SmsSnsResponse = {
  MessageId: string
  Message: string
  PhoneNumber: string
  Subject: string
  MessageAttributes: Record<string, any>
  metadata: string
}

export type VerificationCode = {
  sentAt: Date
  phone: string
  code: string
  verified: boolean
  verifiedAt: string
  tries: number
  expired?: boolean
  expiredAt?: Date
  smsSnsResponse: SmsSnsResponse
}
