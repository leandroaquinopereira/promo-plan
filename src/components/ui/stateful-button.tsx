'use client'

import { cn } from '@promo/lib/utils'
import { motion, useAnimate } from 'motion/react'
import {
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useImperativeHandle,
} from 'react'

import { buttonVariants } from './button'

export type StatefulButtonMethods = {
  startLoading: () => Promise<void>
  stopSuccess: () => Promise<void>
  stopError: () => Promise<void>
}

interface StatefulButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'ref'> {
  className?: string
  children: ReactNode
  ref: RefObject<StatefulButtonMethods | null>
  startsWithLoading?: boolean
  disableLoadingOnClick?: boolean
}

export function StatefulButton({
  className,
  children,
  ref,
  startsWithLoading = false,
  disableLoadingOnClick = false,
  ...props
}: StatefulButtonProps) {
  const [scope, animate] = useAnimate()

  const animateLoading = useCallback(
    async function animateLoading() {
      await animate(
        '.loader',
        {
          width: '20px',
          scale: 1,
          display: 'block',
        },
        {
          duration: 0.2,
        },
      )
    },
    [animate],
  )

  async function animateSuccess() {
    await animate(
      '.loader',
      {
        width: '0px',
        scale: 0,
        display: 'none',
      },
      {
        duration: 0.2,
      },
    )

    await animate(
      '.check',
      {
        width: '20px',
        scale: 1,
        display: 'block',
      },
      {
        duration: 0.2,
      },
    )

    await animate(
      '.check',
      {
        width: '0px',
        scale: 0,
        display: 'none',
      },
      {
        delay: 2,
        duration: 0.2,
      },
    )
  }

  async function animateError() {
    await animate(
      '.loader',
      {
        width: '20px',
        scale: 1,
        display: 'block',
      },
      {
        duration: 0.2,
      },
    )

    await animate(
      '.check',
      {
        width: '0px',
        scale: 0,
        display: 'none',
      },
      {
        duration: 0.2,
      },
    )

    await animate(
      '.error',
      {
        width: '0px',
        scale: 0,
        display: 'none',
      },
      {
        duration: 0.2,
      },
    )

    await animate('.error', {
      width: '0px',
      scale: 0,
      display: 'none',
    })
  }

  async function handleClick(event: MouseEvent<HTMLButtonElement>) {
    try {
      if (!disableLoadingOnClick) {
        await animateLoading()
      }

      await props.onClick?.(event)

      if (!disableLoadingOnClick) {
        await animateSuccess()
      }
    } catch {
      await animateError()
    }
  }

  useImperativeHandle<unknown, StatefulButtonMethods>(ref, () => ({
    startLoading: async () => {
      await animateLoading()
    },
    stopSuccess: async () => {
      await animateSuccess()
    },
    stopError: async () => {
      await animateError()
    },
  }))

  const {
    onClick,
    onDrag,
    onDragStart,
    onDragEnd,
    onAnimationStart,
    onAnimationEnd,
    ...buttonProps
  } = props

  useEffect(() => {
    if (startsWithLoading) {
      animateLoading()
    }
  }, [animateLoading, startsWithLoading])

  return (
    <motion.button
      layout
      layoutId="button"
      ref={scope}
      className={cn(
        'flex min-w-[120px] cursor-pointer items-center justify-center gap-2 rounded-full bg-green-500 px-4 py-2 font-medium text-white transition duration-200 hover:ring-2 hover:ring-zinc-500 dark:ring-offset-black',
        buttonVariants({ variant: 'default' }),
        className,
      )}
      {...buttonProps}
      onClick={handleClick}
    >
      <motion.div layout className="flex items-center gap-2">
        <Loader />
        <CheckIcon />
        <ErrorIcon />
        <motion.span layout>{children}</motion.span>
      </motion.div>
    </motion.button>
  )
}

function Loader() {
  return (
    <motion.svg
      animate={{
        rotate: [0, 360],
      }}
      initial={{
        scale: 0,
        width: 0,
        display: 'none',
      }}
      style={{
        scale: 0.5,
        display: 'none',
      }}
      transition={{
        duration: 0.3,
        repeat: Infinity,
        ease: 'linear',
      }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="loader text-white"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M12 3a9 9 0 1 0 9 9" />
    </motion.svg>
  )
}

function CheckIcon() {
  return (
    <motion.svg
      initial={{
        scale: 0,
        width: 0,
        display: 'none',
      }}
      style={{
        scale: 0.5,
        display: 'none',
      }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="check text-white"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
      <path d="M9 12l2 2l4 -4" />
    </motion.svg>
  )
}

function ErrorIcon() {
  return (
    <motion.svg
      initial={{
        scale: 0,
        width: 0,
        display: 'none',
      }}
      style={{
        scale: 0.5,
        display: 'none',
      }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="error text-white"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
      <path d="M12 9l4 4m0 -4l-4 4" />
      <path d="M12 17l4 4m0 -4l-4 4" />
    </motion.svg>
  )
}
