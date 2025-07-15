import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@promo/components/ui/card'
import {
  Activity,
  CheckCircle,
  FileText,
  type LucideIcon,
  Target,
  XCircle,
} from 'lucide-react'

interface CardStatisticProps {
  title: string
  value: string
  description: string
  icon: 'target' | 'activity' | 'check-circle' | 'x-circle' | 'file-text'
}

const iconMap: Record<string, LucideIcon> = {
  target: Target,
  activity: Activity,
  'check-circle': CheckCircle,
  'x-circle': XCircle,
  'file-text': FileText,
}

export function CardStatistic({
  title,
  value,
  description,
  icon,
}: CardStatisticProps) {
  const Icon = iconMap[icon]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <CardDescription className="text-xs text-muted-foreground">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  )
}
