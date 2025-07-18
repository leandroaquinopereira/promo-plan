'use client'

import { useRouter } from '@bprogress/next'
import { cn } from '@promo/lib/utils'
import type { MouseEvent } from 'react'

import { Button, ButtonProps } from './ui/button'

type RedirectButtonProps = ButtonProps & {
  to: string
}

export function RedirectButton({
  to,
  onClick,
  className,
  ...props
}: RedirectButtonProps) {
  const router = useRouter()

  function handleRedirect(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event)

    router.push(to)
  }

  return (
    <Button {...props} onClick={handleRedirect} className={cn('', className)} />
  )
}
