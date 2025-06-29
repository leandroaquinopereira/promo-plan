import { MotionDiv } from '@promo/components/framer-motion/motion-div'
import { Activity, Clock, UserIcon } from 'lucide-react'

import { CardStatistic } from './card-statistic'

export async function CardStatisticSection() {
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
        value={5}
        description="Número total de usuários registrados e verificados na plataforma desde o lançamento"
      />
      <CardStatistic
        title="Online agora"
        icon={Activity}
        value={32}
        description="Usuários que estão atualmente conectados e ativos na plataforma em tempo real"
      />
      <CardStatistic
        title="Trabalhando agora"
        icon={Clock}
        value={32}
        description="Usuários que estão dentro do horário de trabalho estabelecido e disponíveis para atividades"
      />
    </MotionDiv>
  )
}
