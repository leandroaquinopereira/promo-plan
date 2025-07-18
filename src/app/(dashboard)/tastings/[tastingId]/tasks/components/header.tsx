import type { Tasting } from '@promo/types/firebase'
import { MotionDiv } from '@promo/components/framer-motion/motion-div'
import { RedirectButton } from '@promo/components/redirect-button'
import { Badge } from '@promo/components/ui/badge'
import { tastingStatusColors } from '@promo/constants/tasting-status-colors'
import { tastingStatusMap } from '@promo/constants/tasting-status-map'
import { cn } from '@promo/lib/utils'
import { ArrowRight } from 'lucide-react'

interface TastingTasksHeaderProps {
  tasting: Tasting
}

export async function TastingTasksHeader({ tasting }: TastingTasksHeaderProps) {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tarefas da Degustação</h1>
          <p className="text-muted-foreground">
            Processo #{tasting.id} • {tasting.company.name}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge
          variant="outline"
          className={cn('text-base', tastingStatusColors[tasting.status])}
        >
          {tastingStatusMap[tasting.status]}
        </Badge>
        <RedirectButton
          variant="outline"
          size="sm"
          to={`/tastings/${tasting.id}/detail`}
        >
          Ver detalhes
          <ArrowRight className="size-4" />
        </RedirectButton>
      </div>
    </MotionDiv>
  )
}
