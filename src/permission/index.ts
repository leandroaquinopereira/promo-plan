import type { User } from '@promo/types/firebase'

export class Permission {
  static readonly ADMIN = 'admin'
  static readonly USER = 'freelancer'

  static readonly permissions = [this.ADMIN, this.USER]

  static can(user: User, url: string) {
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

    return paths.some((path) => new URL(url).pathname.startsWith(path))
  }
}
