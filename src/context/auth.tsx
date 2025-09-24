'use client'

import type { User } from '@promo/types/firebase'
import { useState } from 'react'
import { createContext } from 'use-context-selector'

type AuthContextType = {
  user: User
  isAdmin: boolean
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType)

type AuthProviderProps = {
  children: React.ReactNode
  user: User
  isAdmin: boolean
}

export function AuthProvider({ children, user, isAdmin }: AuthProviderProps) {
  const [userState] = useState<User>(user)
  const [isAdminState] = useState<boolean>(isAdmin)

  return (
    <AuthContext.Provider value={{ user: userState, isAdmin: isAdminState }}>
      {children}
    </AuthContext.Provider>
  )
}
