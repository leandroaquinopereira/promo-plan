import { auth } from '@promo/lib/next-auth/auth'
import { permanentRedirect } from 'next/navigation'

type AuthProviderProps = {
  children: React.ReactNode[] | React.ReactNode
}

export async function AuthProvider({ children }: AuthProviderProps) {
  const responseAuth = await auth()
  if (!responseAuth) {
    permanentRedirect('/auth/sign-in')
  }

  return children
}
