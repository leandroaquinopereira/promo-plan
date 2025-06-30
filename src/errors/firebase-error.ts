import type { FirebaseErrorCode } from '@promo/constants/firebase-error-code'

export class FirebaseError extends Error {
  constructor(
    message: string,
    public code: FirebaseErrorCode = FirebaseErrorCode.UNKNOWN_ERROR,
  ) {
    super(message)
    this.name = 'FirebaseError'
    this.code = code
  }
}
