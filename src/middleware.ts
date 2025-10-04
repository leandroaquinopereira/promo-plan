import { type NextRequest, NextResponse } from 'next/server'

import { Collections } from './collections'
import { getFirebaseApps } from './lib/firebase/server'
import { auth } from './lib/next-auth/auth'
import { Permission } from './permission'
import type { User } from './types/firebase'

export default async function middleware(request: NextRequest) {
  // Skip authentication for auth routes and forbidden page to prevent redirect loops
  if (
    request.nextUrl.pathname.startsWith('/auth/') ||
    request.nextUrl.pathname === '/forbidden'
  ) {
    return NextResponse.next()
  }

  const session = await auth()
  if (!session) {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url))
  }

  const apps = getFirebaseApps()

  if (!apps) {
    return NextResponse.redirect(new URL('/forbidden', request.url))
  }

  const user = await apps.firestore
    .collection(Collections.USERS)
    .doc(session.user.id)
    .get()

  if (!user.exists) {
    return NextResponse.redirect(new URL('/forbidden', request.url))
  }

  const canAccess = Permission.can(user.data() as User, request.url)
  if (!canAccess) {
    return NextResponse.redirect(new URL('/forbidden', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
  runtime: 'nodejs',
}
