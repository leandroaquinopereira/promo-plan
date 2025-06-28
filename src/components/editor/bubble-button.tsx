import { cn } from '@promo/lib/utils'
import type { ComponentProps } from 'react'

import { Button } from '../ui/button'

export function BubbleButton({
  className,
  ...rest
}: ComponentProps<typeof Button>) {
  return (
    <Button
      size="icon"
      variant="ghost"
      className={cn(
        'size-6 dark:hover:bg-zinc-800 data-[state=on]:dark:bg-zinc-700 data-[state=on]:bg-zinc-50',
        className,
      )}
      {...rest}
    />
  )
}
