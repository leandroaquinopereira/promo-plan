import { FirebaseErrorCode } from '@promo/constants/firebase-error-code'
import { AuthError } from '@promo/errors/auth-error'
import { getFirebaseApps } from '@promo/lib/firebase/server'
import { auth } from '@promo/lib/next-auth/auth'
import { createServerActionProcedure } from 'zsa'

export const authProcedure = createServerActionProcedure().handler(async () => {
  try {
    const session = await auth()
    const apps = getFirebaseApps()

    if (!apps) {
      throw new AuthError(
        'Firebase apps not initialized.',
        FirebaseErrorCode.FIREBASE_APPS_NOT_INITIALIZED,
      )
    }

    if (!session?.user) {
      throw new AuthError(
        'User not authenticated.',
        FirebaseErrorCode.USER_NOT_AUTHENTICATED,
      )
    }

    return {
      session,
      apps,
    }
  } catch (error) {
    throw new AuthError('An error occurred during authentication.')
  }
})
