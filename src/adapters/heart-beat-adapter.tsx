'use client'

import { updateUserPresenceAction } from '@promo/actions/update-presence'
import { UserStatusEnum } from '@promo/enum/user-status'
import { useSession } from 'next-auth/react'
import { type ReactNode, useCallback, useEffect, useRef } from 'react'
import { useServerAction } from 'zsa-react'

type HeartBeatAdapterProps = {
  children: ReactNode | ReactNode[]
}

export function HeartBeatAdapter({ children }: HeartBeatAdapterProps) {
  const { execute, isPending } = useServerAction(updateUserPresenceAction)
  const session = useSession()

  const offlineTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isUserActiveRef = useRef<boolean>(true)
  const updatePresenceRef = useRef<
    ((userId: string, situation: UserStatusEnum) => Promise<void>) | null
  >(null)

  const updatePresence = useCallback(
    async function updatePresence(
      userId: string,
      situation: UserStatusEnum = UserStatusEnum.ONLINE,
    ) {
      if (isPending) {
        return
      }

      try {
        await execute({
          userId,
          situation,
        })
      } catch (error) {}
    },
    [execute, isPending],
  )

  updatePresenceRef.current = updatePresence

  useEffect(() => {
    if (offlineTimeoutRef.current) {
      clearTimeout(offlineTimeoutRef.current)
      offlineTimeoutRef.current = null
    }

    if (session.status !== 'authenticated' || !session.data?.user) {
      return
    }

    const userId = session.data.user.id

    const clearOfflineTimeout = () => {
      if (offlineTimeoutRef.current) {
        clearTimeout(offlineTimeoutRef.current)
        offlineTimeoutRef.current = null
      }
    }

    const startOfflineTimeout = () => {
      clearOfflineTimeout()
      // 2 minutos = 120000ms
      offlineTimeoutRef.current = setTimeout(() => {
        isUserActiveRef.current = false
        updatePresenceRef.current?.(userId, UserStatusEnum.OFFLINE)
      }, 120000)
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Troca de foco - inicia timeout de 2min
        startOfflineTimeout()
      } else {
        // Voltou ao foco - cancela timeout e marca como online
        clearOfflineTimeout()
        isUserActiveRef.current = true
        updatePresenceRef.current?.(userId, UserStatusEnum.ONLINE)
      }
    }

    const handleFocus = () => {
      clearOfflineTimeout()
      isUserActiveRef.current = true
      updatePresenceRef.current?.(userId, UserStatusEnum.ONLINE)
    }

    const handleBlur = () => {
      // Troca de foco - inicia timeout de 2min
      startOfflineTimeout()
    }

    const handleBeforeUnload = () => {
      // Fechou navegador - offline imediato
      clearOfflineTimeout()
      isUserActiveRef.current = false
      updatePresenceRef.current?.(userId, UserStatusEnum.OFFLINE)
    }

    const handlePageHide = () => {
      // Fechou navegador - offline imediato
      clearOfflineTimeout()
      isUserActiveRef.current = false
      updatePresenceRef.current?.(userId, UserStatusEnum.OFFLINE)
    }

    // Marca como ativo e online inicialmente
    isUserActiveRef.current = true
    updatePresenceRef.current?.(userId, UserStatusEnum.ONLINE)

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('pagehide', handlePageHide)

    return () => {
      clearOfflineTimeout()

      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('pagehide', handlePageHide)

      updatePresenceRef.current?.(userId, UserStatusEnum.OFFLINE)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.status, session.data?.user?.id])

  return children
}
