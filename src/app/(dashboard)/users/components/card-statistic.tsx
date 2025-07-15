import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@promo/components/ui/card'
import type { ElementType } from 'react'

type CardStatisticProps = {
  title: string
  value: string | number
  description: string
  icon: ElementType
}

export function CardStatistic({
  title,
  value,
  description,
  icon: IconComponent,
}: CardStatisticProps) {
  return (
    <Card className="p-4 h-full">
      <div>
        <CardHeader className="flex flex-row items-center justify-between p-0 pb-2">
          <CardTitle className="font-medium">{title}</CardTitle>
          <IconComponent className="size-6 text-muted-foreground" />
        </CardHeader>
        <CardDescription>{description || ''}</CardDescription>
      </div>
      <CardContent className="p-0">
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}
