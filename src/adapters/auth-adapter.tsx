import { Collections } from '@promo/collections'
import { getFirebaseApps } from '@promo/lib/firebase/server'
import { auth } from '@promo/lib/next-auth/auth'
import { firestore } from 'firebase-admin'
import { permanentRedirect, redirect } from 'next/navigation'
import { after } from 'next/server'

type AuthAdapterProps = {
  children: React.ReactNode[] | React.ReactNode
}

export async function AuthAdapter({ children }: AuthAdapterProps) {
  const responseAuth = await auth()
  if (!responseAuth) {
    permanentRedirect('/auth/sign-in')
  }

  after(async () => {
    const apps = getFirebaseApps()

    if (!apps) {
      return
    }

    await apps.firestore
      .collection(Collections.USERS)
      .doc(responseAuth.user.phoneNumber.replace(/\D/, '').replace(/^\+55/, ''))
      .set(
        {
          lastLoggedAt: firestore.Timestamp.now().toMillis(),
        },
        {
          merge: true,
        },
      )
  })

  return children
}
