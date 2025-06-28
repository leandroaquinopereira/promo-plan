import { MotionDiv } from '@promo/components/framer-motion/motion-div'
import { Card, CardContent } from '@promo/components/ui/card'
import { Muted } from '@promo/components/ui/typography'
import { cn } from '@promo/lib/utils'
import { CalendarCheck, CalendarClock, FileSliders, Users } from 'lucide-react'

export async function InfoSection() {
  const infoCards = [
    {
      title: 'Degustações Ativas',
      count: '8',
      icon: CalendarClock,
      color: 'text-orange-600',
    },
    {
      title: 'Freelancers disponíveis',
      count: '12',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Relatórios pendentes',
      count: '12',
      icon: FileSliders,
      color: 'text-green-600',
    },
    {
      title: 'Degustações concluídas',
      count: '12',
      icon: CalendarCheck,
      color: 'text-purple-600',
    },
  ]

  return (
    <MotionDiv
      className="grid grid-cols-1 gap-2 sm:gap-y-2 sm:grid-cols-2 xl:grid-cols-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      {infoCards.map((info, index) => {
        const Icon = info.icon

        return (
          <MotionDiv
            key={info.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.3 }}
          >
            <Card>
              <CardContent>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-col items-start">
                    <Muted className="font-semibold truncate">
                      {info.title}
                    </Muted>
                    <span className="font-bold text-4xl">{info.count}</span>
                  </div>

                  <Icon className={cn('size-9 shrink-0 text-foreground')} />
                </div>
              </CardContent>
            </Card>
          </MotionDiv>
        )
      })}
    </MotionDiv>
  )
}
