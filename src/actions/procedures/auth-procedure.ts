import { Collections } from '@promo/collections'
import { FirebaseErrorCode } from '@promo/constants/firebase-error-code'
import { UserSituationEnum } from '@promo/enum/user-situation'
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

    const user = await apps.firestore
      .collection(Collections.USERS)
      .doc(session.user.id)
      .get()

    if (!user.exists) {
      throw new AuthError(
        'User not authenticated.',
        FirebaseErrorCode.USER_NOT_AUTHENTICATED,
      )
    }

    const canBeProcessed = user.data()?.situation === UserSituationEnum.ACTIVE
    if (!canBeProcessed) {
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
