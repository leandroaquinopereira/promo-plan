import { FirestoreAdapter } from '@auth/firebase-adapter'
import { Collections } from '@promo/collections'
import { env } from '@promo/env'
import { comparePassword } from '@promo/utils/crypto'
import { cert } from 'firebase-admin/app'
import NextAuth, { CredentialsSignin } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

import { getFirebaseApps } from '../firebase/server'

class InvalidLoginError extends CredentialsSignin {
  code = 'Número de telefone ou senha inválidos'
}

class ServerConnectionError extends CredentialsSignin {
  code = 'Erro de conexão com o servidor'
}

export const { signIn, signOut, auth, handlers } = NextAuth({
  adapter: FirestoreAdapter({
    credential: cert({
      projectId: env.AUTH_FIREBASE_PROJECT_ID,
      clientEmail: env.AUTH_FIREBASE_CLIENT_EMAIL,
      privateKey: env.AUTH_FIREBASE_PRIVATE_KEY,
    }),
  }),
  providers: [
    Credentials({
      credentials: {
        phoneNumber: { label: 'Phone Number', type: 'tel' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.phoneNumber || !credentials?.password) {
          throw new InvalidLoginError()
        }

        const apps = await getFirebaseApps()
        if (!apps) {
          throw new ServerConnectionError()
        }

        const { firestore } = apps
        const userRef = await firestore
          .collection(Collections.USERS)
          .doc(credentials.phoneNumber as string)
          .get()

        if (!userRef.exists) {
          throw new InvalidLoginError()
        }

        const user = userRef.data()
        const isCorrectPassword = await comparePassword(
          credentials.password as string,
          user?.password,
        )

        if (isCorrectPassword) {
          return {
            id: userRef.id,
            phoneNumber: userRef.id,
            name: user?.name,
          }
        }

        throw new InvalidLoginError()
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  // cookies: {
  //   sessionToken: {
  //     name: '__Secure-promo-plan.token',
  //   },
  // },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.phoneNumber = user.phoneNumber
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id as string
      session.user.phoneNumber = token.phoneNumber as string
      return session
    },
  },
})
