'use client'

import { useIsMobile } from '@promo/hooks/use-mobile'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button, type ButtonProps } from './button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './drawer'

type ModalProps = {
  children: ReactNode | ReactNode[]
  title: string
  description?: string
  trigger?: ReactNode
  closeButtonProps?: ButtonProps
  extraFooterContent?: ReactNode | ReactNode[]
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function Modal({
  children,
  title,
  description,
  trigger,
  closeButtonProps = {},
  extraFooterContent,
  isOpen,
  onOpenChange,
}: ModalProps) {
  const isMobile = useIsMobile()

  if (isOpen === undefined && trigger === undefined) {
    throw new Error('isOpen or trigger are required')
  }

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onOpenChange}>
        {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
        <DrawerContent className="flex flex-col gap-0 overflow-y-visible [&>button:last-child]:top-3.5 w-screen">
          <DrawerHeader className="px-6">
            <DrawerTitle className="text-left">{title}</DrawerTitle>
            <DrawerDescription className="text-left">
              {description}
            </DrawerDescription>
          </DrawerHeader>

          <div className="p-6">{children}</div>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline" {...closeButtonProps}>
                Close
              </Button>
            </DrawerClose>

            {extraFooterContent}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="flex flex-col gap-0 p-0 overflow-y-visible sm:max-w-2xl [&>button:last-child]:top-3.5 w-screen"
      >
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b px-6 py-4 text-base flex items-center justify-between">
            <div className="">
              {title}

              <DialogDescription className="">{description}</DialogDescription>
            </div>
            <DialogClose asChild>
              <Button variant="outline" icon={X} size="icon" />
            </DialogClose>
          </DialogTitle>
        </DialogHeader>

        <div className="p-6">{children}</div>

        <DialogFooter className="border-t px-6 py-4">
          <DialogClose asChild>
            <Button variant="outline" {...closeButtonProps}>
              Close
            </Button>
          </DialogClose>

          {extraFooterContent}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
