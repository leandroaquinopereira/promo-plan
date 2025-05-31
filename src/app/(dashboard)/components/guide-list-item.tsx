import { cn } from '@promo/lib/utils'
import type { ComponentProps } from 'react'

type GuideListItemProps = ComponentProps<'div'>

export function GuideListItem({
  className,
  children,
  ...props
}: GuideListItemProps) {
  return (
    <div className={cn('flex items-center gap-1', className)} {...props}>
      <div className="size-2 rounded-full scale-75 bg-foreground" />
      {children}
    </div>
  )
}
