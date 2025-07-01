'use client'

import { updateUserPresenceAction } from '@promo/actions/update-presence'
import { useSession } from 'next-auth/react'
import { type ReactNode, useCallback, useEffect, useRef } from 'react'
import { useServerAction } from 'zsa-react'

type HeartBeatAdapterProps = {
  children: ReactNode | ReactNode[]
}

export function HeartBeatAdapter({ children }: HeartBeatAdapterProps) {
  const { execute, isPending } = useServerAction(updateUserPresenceAction)
  const session = useSession()

  const intervalIdRef = useRef<NodeJS.Timeout | null>(null)
  const offlineTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isUserActiveRef = useRef<boolean>(true)
  const updatePresenceRef = useRef<
    ((userId: string, situation: 'online' | 'offline') => Promise<void>) | null
  >(null)

  const updatePresence = useCallback(
    async function updatePresence(
      userId: string,
      situation: 'online' | 'offline' = 'online',
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
    // Limpa intervals anteriores
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current)
      intervalIdRef.current = null
    }

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
        updatePresenceRef.current?.(userId, 'offline')
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
        updatePresenceRef.current?.(userId, 'online')
      }
    }

    const handleFocus = () => {
      clearOfflineTimeout()
      isUserActiveRef.current = true
      updatePresenceRef.current?.(userId, 'online')
    }

    const handleBlur = () => {
      // Troca de foco - inicia timeout de 2min
      startOfflineTimeout()
    }

    const handleBeforeUnload = () => {
      // Fechou navegador - offline imediato
      clearOfflineTimeout()
      isUserActiveRef.current = false
      updatePresenceRef.current?.(userId, 'offline')
    }

    const handlePageHide = () => {
      // Fechou navegador - offline imediato
      clearOfflineTimeout()
      isUserActiveRef.current = false
      updatePresenceRef.current?.(userId, 'offline')
    }

    // Marca como ativo e online inicialmente
    isUserActiveRef.current = true
    updatePresenceRef.current?.(userId, 'online')

    intervalIdRef.current = setInterval(() => {
      // Só envia online se o usuário estiver ativo E a página estiver visível
      if (isUserActiveRef.current && !document.hidden) {
        updatePresenceRef.current?.(userId, 'online')
      }
    }, 10_000)

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('pagehide', handlePageHide)

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current)
        intervalIdRef.current = null
      }

      clearOfflineTimeout()

      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('pagehide', handlePageHide)

      updatePresenceRef.current?.(userId, 'offline')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.status, session.data?.user?.id])

  return children
}
