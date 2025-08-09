import { MotionDiv } from '@promo/components/framer-motion/motion-div'
import { Card, CardContent } from '@promo/components/ui/card'
import { dayjsApi } from '@promo/lib/dayjs'
import { Clock } from 'lucide-react'

type TaskNoDayAlertProps = {
  tasting: {
    startDate: string
    endDate: string
  }
}

export async function TaskNoDayAlert({ tasting }: TaskNoDayAlertProps) {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
              <Clock className="size-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-medium text-amber-900 dark:text-amber-100">
                Não é o dia da inspeção
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                As tarefas só podem ser iniciadas durante o período da
                degustação: {dayjsApi(tasting.startDate).format('DD/MM/YYYY')} -{' '}
                {dayjsApi(tasting.endDate).format('DD/MM/YYYY')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </MotionDiv>
  )
}
