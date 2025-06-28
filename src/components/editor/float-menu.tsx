import { cn } from '@promo/lib/utils'
import React, { type ComponentProps, type ElementType, Fragment } from 'react'

import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import { Muted } from '../ui/typography'

type FloatMenuGroupProps = ComponentProps<'div'>

export function FloatMenuGroup({ className, ...rest }: FloatMenuGroupProps) {
  return (
    <div
      className={cn('flex flex-col w-full mb-4 last:mb-0', className)}
      {...rest}
    />
  )
}

export function FloatMenuGroupTitle({
  className,
  withSeparator = true,
  title,
  ...rest
}: ComponentProps<'div'> & {
  withSeparator?: boolean
  title: string
}) {
  return (
    <Fragment>
      <div className={cn('p-1 px-3', className)} {...rest}>
        <Muted>{title}</Muted>
      </div>
      {withSeparator && <Separator className="my-1" />}
    </Fragment>
  )
}

export function FloatMenuGroupButton({
  className,
  icon: Icon,
  description,
  ...rest
}: ComponentProps<'button'> & {
  icon: ElementType
  description: string
}) {
  return (
    <Button
      variant="ghost"
      className={cn(
        'rounded-none w-full justify-start h-fit items-start',
        className,
      )}
      data-slot="float-menu-group-button"
      data-description={description}
      {...rest}
    >
      <Icon className="size-4" />
      <p
        className="text-xs break-words whitespace-normal text-start"
        dangerouslySetInnerHTML={{
          __html: description,
        }}
      />
    </Button>
  )
}
