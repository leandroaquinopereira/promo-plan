import { FirebaseErrorCode } from '@promo/constants/firebase-error-code'

export class AuthError extends Error {
  constructor(
    message: string,
    public code: FirebaseErrorCode = FirebaseErrorCode.UNKNOWN_ERROR,
  ) {
    super(message)
    this.name = 'AuthError'
    this.code = code
  }
}
