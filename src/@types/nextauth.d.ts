import { DefaultSession, DefaultUser } from 'next-auth'
import { AdapterUser as DefaultAdapterUser } from 'next-auth/adapters'

declare module 'next-auth/adapters' {
  interface AdapterUser extends DefaultAdapterUser {
    phoneNumber: string
  }
}

declare module 'next-auth' {
  interface Session {
    user: {
      /** The user's unique ID */
      id: string

      /** The user's phone number */
      phoneNumber: string
    } & DefaultSession['user']
  }

  // interface CallbacksOptions {
  //   session?: (
  //     params: {
  //       session: Session
  //       token: JWT
  //       user: AdapterUser
  //     } & {
  //       newSession: any
  //       trigger: 'update'
  //     },
  //   ) => Promise<Session | null>
  // }

  interface User extends DefaultUser {
    id: string
    phoneNumber: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    /** The user's unique ID */
    id: string
    phoneNumber: string
  }
}