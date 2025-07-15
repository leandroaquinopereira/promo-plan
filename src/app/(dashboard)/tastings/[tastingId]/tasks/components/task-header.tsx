'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@promo/components/ui/card'
import { ClipboardList } from 'lucide-react'

interface TaskHeaderProps {
  title: string
  description: string
}

export function TaskHeader({ title, description }: TaskHeaderProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="size-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
