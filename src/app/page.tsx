import { auth } from '@promo/lib/next-auth/auth'
import { permanentRedirect } from 'next/navigation'

export default async function Home() {
  const responseAuth = await auth()
  console.log(responseAuth)
  if (!responseAuth) {
    permanentRedirect('/auth/sign-in')
  }

  return (
    <main>
      <div>Hello world!</div>
    </main>
  )
}
