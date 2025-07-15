import { FirebaseErrorCode } from '@promo/constants/firebase-error-code'
import { FirebaseError } from '@promo/errors/firebase-error'
import { getFirebaseApps } from '@promo/lib/firebase/server'
import { createServerActionProcedure } from 'zsa'

export const publicProcedure = createServerActionProcedure().handler(
  async () => {
    const apps = getFirebaseApps()
    if (!apps) {
      throw new FirebaseError(
        'Firebase apps not initialized',
        FirebaseErrorCode.FIREBASE_APPS_NOT_INITIALIZED,
      )
    }

    return {
      apps,
    }
  },
)
