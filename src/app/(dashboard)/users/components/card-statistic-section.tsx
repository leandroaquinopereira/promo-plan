'use client'

import { Collections } from '@promo/collections'
import { MotionDiv } from '@promo/components/framer-motion/motion-div'
import { UserStatusEnum } from '@promo/enum/user-status'
import { firestore } from '@promo/lib/firebase/client'
import {
  and,
  collection,
  getCountFromServer,
  onSnapshot,
  or,
  query,
  type Unsubscribe,
  where,
} from 'firebase/firestore'
import { Activity, Clock, UserIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { CardStatistic } from './card-statistic'

export function CardStatisticSection() {
  const [totalOfUsers, setTotalOfUsers] = useState(0)
  const [totalOfUsersWorking, setTotalOfUsersWorking] = useState(0)
  const [totalOfUsersOnline, setTotalOfUsersOnline] = useState(0)

  const countUnsubscribeRef = useRef<Unsubscribe | null>(null)
  const countOnlineUnsubscribeRef = useRef<Unsubscribe | null>(null)
  const countWorkingUnsubscribeRef = useRef<Unsubscribe | null>(null)

  useEffect(() => {
    async function setupRealtimeListener() {
      try {
        // cleaning up previous listener if exists
        if (countUnsubscribeRef.current) {
          countUnsubscribeRef.current()
        }

        const coll = collection(firestore, Collections.USERS)

        // counter query (unpaginated)
        const countQuery = query(coll)

        const total = await getCountFromServer(countQuery)
        setTotalOfUsers(total.data().count || 0)

        // setting up the realtime listener
        countUnsubscribeRef.current = onSnapshot(
          countQuery,
          async (snapshot) => {
            const total = await getCountFromServer(countQuery)
            setTotalOfUsers(total.data().count || 0)
          },
        )
      } catch (error) {
        console.error('Error setting up realtime listener:', error)
        // setResponse({
        //   total: 0,
        //   users: [],
        // })
      }
    }

    setupRealtimeListener()

    // cleaning up the listener on component unmount
    return () => {
      if (countUnsubscribeRef.current) {
        countUnsubscribeRef.current()
        countUnsubscribeRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    async function setupRealtimeListener() {
      try {
        // cleaning up previous listener if exists
        if (countOnlineUnsubscribeRef.current) {
          countOnlineUnsubscribeRef.current()
        }

        const coll = collection(firestore, Collections.USERS)

        // counter query (unpaginated)
        const countQuery = query(
          coll,
          or(
            where('status', '==', UserStatusEnum.ONLINE),
            where('status', '==', UserStatusEnum.WORKING),
          ),
        )

        const total = await getCountFromServer(countQuery)
        setTotalOfUsersOnline(total.data().count || 0)

        // setting up the realtime listener
        countOnlineUnsubscribeRef.current = onSnapshot(
          countQuery,
          async (snapshot) => {
            const total = await getCountFromServer(countQuery)
            setTotalOfUsersOnline(total.data().count || 0)
          },
        )
      } catch (error) {
        console.error('Error setting up realtime listener:', error)
        // setResponse({
        //   total: 0,
        //   users: [],
        // })
      }
    }

    setupRealtimeListener()

    // cleaning up the listener on component unmount
    return () => {
      if (countOnlineUnsubscribeRef.current) {
        countOnlineUnsubscribeRef.current()
        countOnlineUnsubscribeRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    async function setupRealtimeListener() {
      try {
        // cleaning up previous listener if exists
        if (countWorkingUnsubscribeRef.current) {
          countWorkingUnsubscribeRef.current()
        }

        const coll = collection(firestore, Collections.USERS)

        // counter query (unpaginated)
        const countQuery = query(
          coll,
          and(where('situation', '==', UserStatusEnum.WORKING)),
        )

        const total = await getCountFromServer(countQuery)
        setTotalOfUsersWorking(total.data().count || 0)

        // setting up the realtime listener
        countWorkingUnsubscribeRef.current = onSnapshot(
          countQuery,
          async (snapshot) => {
            const total = await getCountFromServer(countQuery)
            setTotalOfUsersWorking(total.data().count || 0)
          },
        )
      } catch (error) {
        console.error('Error setting up realtime listener:', error)
        // setResponse({
        //   total: 0,
        //   users: [],
        // })
      }
    }

    setupRealtimeListener()

    // cleaning up the listener on component unmount
    return () => {
      if (countWorkingUnsubscribeRef.current) {
        countWorkingUnsubscribeRef.current()
        countWorkingUnsubscribeRef.current = null
      }
    }
  }, [])

  return (
    <MotionDiv
      className="grid gap-4 grid-cols-1 @xl:grid-cols-3 w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <CardStatistic
        title="Total de usuários"
        icon={UserIcon}
        value={totalOfUsers}
        description="Número total de usuários registrados e verificados na plataforma desde o lançamento"
      />
      <CardStatistic
        title="Online agora"
        icon={Activity}
        value={totalOfUsersOnline}
        description="Usuários que estão atualmente conectados e ativos na plataforma em tempo real"
      />
      <CardStatistic
        title="Trabalhando agora"
        icon={Clock}
        value={totalOfUsersWorking}
        description="Usuários que estão dentro do horário de trabalho estabelecido e disponíveis para atividades"
      />
    </MotionDiv>
  )
}
