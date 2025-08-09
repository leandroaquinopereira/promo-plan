import { MotionDiv } from '@promo/components/framer-motion/motion-div'
import { RedirectButton } from '@promo/components/redirect-button'
import type { TastingStatus } from '@promo/types/models/tasting'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface TastingTasksHeaderProps {
  tasting: {
    id: string
    company: {
      name: string
    }
  }
}

export async function TastingTasksHeader({ tasting }: TastingTasksHeaderProps) {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-between w-full"
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
        {/* <Badge
          variant="outline"
          className={cn('text-base', tastingStatusColors[tasting.status])}
        >
          {tastingStatusMap[tasting.status]}
        </Badge> */}
        <RedirectButton variant="outline" size="sm" to={`/tastings`}>
          <ArrowLeft className="size-4" />
          Voltar
        </RedirectButton>
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
