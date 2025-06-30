'use client'

import { updateUserPresenceAction } from '@promo/actions/update-presence'
import { dayjsApi } from '@promo/lib/dayjs'
import { cleanUserId } from '@promo/utils/clean-user-id'
import { useSession } from 'next-auth/react'
import { type ReactNode, useCallback, useEffect, useRef } from 'react'
import { useServerAction } from 'zsa-react'

const HEARTBEAT_INTERVAL = 2 * 60 * 1000 // 2 minutos
const INACTIVITY_TIMEOUT = 10 * 60 * 1000 // 10 minutos

type HeartBeatAdapterProps = {
  children: ReactNode | ReactNode[]
}

export function HeartBeatAdapter({ children }: HeartBeatAdapterProps) {
  const { execute, isPending: isUpdatingUserPresence } = useServerAction(
    updateUserPresenceAction,
  )

  const session = useSession()
  const onlinePresenceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastActivityRef = useRef(dayjsApi())
  const lastPresenceUpdateRef = useRef(dayjsApi().subtract(1, 'hour'))
  const activityDebounceRef = useRef<NodeJS.Timeout | null>(null)

  const updatePresence = useCallback(
    function (isOnline: boolean) {
      if (session.status !== 'authenticated' || !session.data?.user.id) {
        return
      }

      // Evita chamadas muito frequentes (mínimo 15 segundos entre updates)
      const now = dayjsApi()
      if (isOnline && now.diff(lastPresenceUpdateRef.current, 'seconds') < 15) {
        return
      }

      const cleanedUserId = cleanUserId(session.data.user.id)

      if (isOnline) {
        lastPresenceUpdateRef.current = now
        execute({
          userId: cleanedUserId,
        }).catch((error) => {
          console.error('Failed to update user presence:', error)
        })
      }
      // Note: Para offline, o backend irá lidar com a lógica através de timeouts
    },
    [execute, session.data?.user.id, session.status],
  )

  const resetInactivityTimer = useCallback(
    function () {
      lastActivityRef.current = dayjsApi()

      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current)
      }

      inactivityTimeoutRef.current = setTimeout(() => {
        updatePresence(false)
      }, INACTIVITY_TIMEOUT)
    },
    [updatePresence],
  )

  const handleActivity = useCallback(
    function () {
      lastActivityRef.current = dayjsApi()
      resetInactivityTimer()

      // Debounce para evitar muitas chamadas
      if (activityDebounceRef.current) {
        clearTimeout(activityDebounceRef.current)
      }

      activityDebounceRef.current = setTimeout(() => {
        updatePresence(true)
      }, 5000) // 5 segundos de debounce
    },
    [resetInactivityTimer, updatePresence],
  )

  const handleVisibilityChange = useCallback(
    function () {
      if (document.hidden) {
        updatePresence(false)
      } else {
        handleActivity()
      }
    },
    [handleActivity, updatePresence],
  )

  const handleBeforeUnload = useCallback(
    function () {
      updatePresence(false)
    },
    [updatePresence],
  )

  useEffect(() => {
    if (session.status !== 'authenticated') {
      return
    }

    const userId = session.data?.user.id
    if (!userId) {
      return
    }

    // Marca como online ao iniciar
    updatePresence(true)
    resetInactivityTimer()

    // Heartbeat interval
    onlinePresenceTimeoutRef.current = setInterval(() => {
      if (isUpdatingUserPresence) {
        return
      }

      const timeSinceLastActivity = dayjsApi().diff(
        lastActivityRef.current,
        'milliseconds',
      )
      if (timeSinceLastActivity < INACTIVITY_TIMEOUT) {
        updatePresence(true)
      }
    }, HEARTBEAT_INTERVAL)

    // Activity events
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ]
    activityEvents.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true })
    })

    // Visibility and unload events
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('focus', handleActivity)
    window.addEventListener('blur', () => updatePresence(false))

    return () => {
      if (onlinePresenceTimeoutRef.current) {
        clearInterval(onlinePresenceTimeoutRef.current)
        onlinePresenceTimeoutRef.current = null
      }

      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current)
      }

      if (activityDebounceRef.current) {
        clearTimeout(activityDebounceRef.current)
      }

      // Remove event listeners
      activityEvents.forEach((event) => {
        document.removeEventListener(event, handleActivity)
      })

      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('focus', handleActivity)
      window.removeEventListener('blur', () => updatePresence(false))

      // Marca como offline ao desmontar
      updatePresence(false)
    }
  }, [
    execute,
    isUpdatingUserPresence,
    session.data?.user.id,
    session.status,
    updatePresence,
    resetInactivityTimer,
    handleActivity,
    handleVisibilityChange,
    handleBeforeUnload,
  ])

  return children
}
