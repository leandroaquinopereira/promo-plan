'use client'

import { cn } from '@promo/lib/utils'
import { Eye, EyeClosed } from 'lucide-react'
import { type ComponentProps, useState } from 'react'

type PasswordFieldProps = ComponentProps<'input'>

export function PasswordField({
  className,
  disabled = false,
  ...props
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        'has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50',
        className,
      )}
    >
      <input
        type={showPassword ? 'text' : 'password'}
        disabled={disabled}
        className="px-3 py-1 h-full w-full focus-visible:border-0 focus-visible:outline-0 focus-visible:ring-0"
        {...props}
      />

      <button
        className="w-9 h-full flex items-center justify-center text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        type="button"
        disabled={disabled}
        onClick={() => setShowPassword((prev) => !prev)}
      >
        <Eye className={cn('hidden size-4', !showPassword && 'block')} />
        <EyeClosed className={cn('hidden size-4', showPassword && 'block')} />
      </button>
    </div>
  )
}
