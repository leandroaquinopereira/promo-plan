'use client'

import { useIsMobile } from '@promo/hooks/use-mobile'
import { cn } from '@promo/lib/utils'
import type { ClassValue } from 'clsx'
import {
  type ComponentProps,
  type ReactNode,
  type RefObject,
  useImperativeHandle,
  useState,
} from 'react'
import { createContext } from 'use-context-selector'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
} from './ui/drawer'

enum ModalState {
  OPEN = 'open',
  CLOSED = 'closed',
}

type ModalContextType = {
  state: ModalState
  open: () => void
  close: () => void
}

export const ModalContext = createContext<ModalContextType>(
  {} as ModalContextType,
)

export type ModalMethodsRef = {
  open: () => void
  close: () => void
}

type ModalProps = {
  children: ReactNode | ReactNode[]
  dialogProps?: ComponentProps<typeof Dialog>
  drawerProps?: ComponentProps<typeof Drawer>
  ref?: RefObject<ModalMethodsRef | null>
}

export function Modal({ children, dialogProps, drawerProps, ref }: ModalProps) {
  const [state, setState] = useState<ModalState>(ModalState.CLOSED)
  const isMobile = useIsMobile()

  function open() {
    setState(ModalState.OPEN)
  }

  function close() {
    setState(ModalState.CLOSED)
  }

  useImperativeHandle(
    ref,
    () => ({
      state,
      open,
      close,
    }),
    [state],
  )

  return (
    <ModalContext.Provider value={{ state, open, close }}>
      {isMobile ? (
        <Drawer {...drawerProps}>{children}</Drawer>
      ) : (
        <Dialog {...dialogProps}>{children}</Dialog>
      )}
    </ModalContext.Provider>
  )
}

type ModalPortalProps = {
  children: ReactNode | ReactNode[]
  drawerProps?: ComponentProps<typeof DrawerPortal>
  dialogProps?: ComponentProps<typeof DialogPortal>
}

export function ModalPortal({
  children,
  drawerProps,
  dialogProps,
}: ModalPortalProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return <DrawerPortal {...drawerProps}>{children}</DrawerPortal>
  }

  return <DialogPortal {...dialogProps}>{children}</DialogPortal>
}

type ModalTriggerProps = {
  children: ReactNode | ReactNode[]
  drawerProps?: ComponentProps<typeof DrawerTrigger>
  dialogProps?: ComponentProps<typeof DialogTrigger>
  className?: ClassValue
  asChild?: boolean
}

export function ModalTrigger({
  children,
  drawerProps,
  dialogProps,
  className,
  asChild,
}: ModalTriggerProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <DrawerTrigger
        {...drawerProps}
        className={cn(className, drawerProps?.className)}
        asChild={asChild}
      >
        {children}
      </DrawerTrigger>
    )
  }

  return (
    <DialogTrigger
      {...dialogProps}
      className={cn(className, dialogProps?.className)}
      asChild={asChild}
    >
      {children}
    </DialogTrigger>
  )
}

type ModalCloseProps = {
  children: ReactNode | ReactNode[]
  drawerProps?: ComponentProps<typeof DrawerClose>
  dialogProps?: ComponentProps<typeof DialogClose>
  className?: ClassValue
}

export function ModalClose({
  children,
  drawerProps,
  dialogProps,
  className,
}: ModalCloseProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <DrawerClose
        {...drawerProps}
        className={cn(className, drawerProps?.className)}
      >
        {children}
      </DrawerClose>
    )
  }

  return (
    <DialogClose
      {...dialogProps}
      className={cn(className, dialogProps?.className)}
    >
      {children}
    </DialogClose>
  )
}

type ModalOverlayProps = {
  children: ReactNode | ReactNode[]
  drawerProps?: ComponentProps<typeof DrawerOverlay>
  dialogProps?: ComponentProps<typeof DialogOverlay>
  className?: ClassValue
}

export function ModalOverlay({
  children,
  drawerProps,
  dialogProps,
  className,
}: ModalOverlayProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <DrawerOverlay
        {...drawerProps}
        className={cn(className, drawerProps?.className)}
      >
        {children}
      </DrawerOverlay>
    )
  }

  return (
    <DialogOverlay
      {...dialogProps}
      className={cn(className, dialogProps?.className)}
    >
      {children}
    </DialogOverlay>
  )
}

type ModalContentProps = {
  children: ReactNode | ReactNode[]
  drawerProps?: ComponentProps<typeof DrawerContent>
  dialogProps?: ComponentProps<typeof DialogContent>
  className?: ClassValue
}

export function ModalContent({
  children,
  drawerProps,
  dialogProps,
  className,
}: ModalContentProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <DrawerContent
        {...drawerProps}
        className={cn('', className, drawerProps?.className)}
      >
        {children}
      </DrawerContent>
    )
  }

  return (
    <DialogContent
      {...dialogProps}
      className={cn('', className, dialogProps?.className)}
    >
      {children}
    </DialogContent>
  )
}

type ModalHeaderProps = {
  children: ReactNode | ReactNode[]
  drawerProps?: ComponentProps<typeof DrawerHeader>
  dialogProps?: ComponentProps<typeof DialogHeader>
  className?: ClassValue
}

export function ModalHeader({
  children,
  drawerProps,
  dialogProps,
  className,
}: ModalHeaderProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <DrawerHeader
        {...drawerProps}
        className={cn(className, drawerProps?.className)}
      >
        {children}
      </DrawerHeader>
    )
  }

  return (
    <DialogHeader
      {...dialogProps}
      className={cn(className, dialogProps?.className)}
    >
      {children}
    </DialogHeader>
  )
}

type ModalFooterProps = {
  children: ReactNode | ReactNode[]
  drawerProps?: ComponentProps<typeof DrawerFooter>
  dialogProps?: ComponentProps<typeof DialogFooter>
  className?: ClassValue
}

export function ModalFooter({
  children,
  drawerProps,
  dialogProps,
  className,
}: ModalFooterProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <DrawerFooter
        {...drawerProps}
        className={cn(className, drawerProps?.className)}
      >
        {children}
      </DrawerFooter>
    )
  }

  return (
    <DialogFooter
      {...dialogProps}
      className={cn(className, dialogProps?.className)}
    >
      {children}
    </DialogFooter>
  )
}

type ModalTitleProps = {
  children: ReactNode | ReactNode[]
  drawerProps?: ComponentProps<typeof DrawerTitle>
  dialogProps?: ComponentProps<typeof DialogTitle>
  className?: ClassValue
}

export function ModalTitle({
  children,
  drawerProps,
  dialogProps,
  className,
}: ModalTitleProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <DrawerTitle
        {...drawerProps}
        className={cn(className, drawerProps?.className)}
      >
        {children}
      </DrawerTitle>
    )
  }

  return (
    <DialogTitle
      {...dialogProps}
      className={cn(className, dialogProps?.className)}
    >
      {children}
    </DialogTitle>
  )
}

type ModalDescriptionProps = {
  children: ReactNode | ReactNode[]
  drawerProps?: ComponentProps<typeof DrawerDescription>
  dialogProps?: ComponentProps<typeof DialogDescription>
  className?: ClassValue
}

export function ModalDescription({
  children,
  drawerProps,
  dialogProps,
  className,
}: ModalDescriptionProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <DrawerDescription
        {...drawerProps}
        className={cn(className, drawerProps?.className)}
      >
        {children}
      </DrawerDescription>
    )
  }

  return (
    <DialogDescription
      {...dialogProps}
      className={cn(className, dialogProps?.className)}
    >
      {children}
    </DialogDescription>
  )
}

type ModalFormContainerProps = ComponentProps<'div'>

export function ModalFormContainer({
  className,
  ...props
}: ModalFormContainerProps) {
  const isMobile = useIsMobile()
  return <div className={cn('', isMobile && 'p-4', className)} {...props} />
}
