import type { User } from '@promo/types/firebase'

export class Permission {
  static readonly ADMIN = 'admin'
  static readonly USER = 'freelancer'

  static readonly permissions = [this.ADMIN, this.USER]

  static can(user: User, url: string) {
    console.log('user', user)
    console.log('url', url)

    if (url.includes('forbidden') || url.includes('sign-in')) {
      return true
    }

    if (user.role.slug === 'admin') {
      return true
    }

    if (user.role.slug === 'freelancer') {
      return this.freelancer(url)
    }
  }

  private static freelancer(url: string) {
    const paths = ['/', '/tasks', '/guides', '/settings', '/profile']

    console.log('url', url)
    console.log('paths', paths)
    console.log('new URL(url).pathname', new URL(url).pathname)
    return paths.some((path) => new URL(url).pathname.startsWith(path))
  }
}
