import { MotionDiv } from '@promo/components/framer-motion/motion-div'

import { CardStatistic } from './card-statistic'

export async function CardStatisticSection() {
  // Mock data - em produção viria de uma API/query
  const stats = {
    total: 156,
    active: 23,
    completed: 89,
    cancelled: 12,
    draft: 32,
  }

  return (
    <MotionDiv
      className="grid gap-4 @md:grid-cols-2 @lg:grid-cols-4 @xl:grid-cols-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <CardStatistic
        title="Total"
        value={stats.total.toString()}
        description="Degustações cadastradas"
        icon="target"
      />
      <CardStatistic
        title="Ativas"
        value={stats.active.toString()}
        description="Em andamento"
        icon="activity"
      />
      <CardStatistic
        title="Concluídas"
        value={stats.completed.toString()}
        description="Finalizadas"
        icon="check-circle"
      />
      <CardStatistic
        title="Canceladas"
        value={stats.cancelled.toString()}
        description="Canceladas"
        icon="x-circle"
      />
      <CardStatistic
        title="Rascunhos"
        value={stats.draft.toString()}
        description="Não iniciadas"
        icon="file-text"
      />
    </MotionDiv>
  )
}
