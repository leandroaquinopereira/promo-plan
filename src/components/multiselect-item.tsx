import { cn } from '@promo/lib/utils'
import type { ClassValue } from 'clsx'
import { XIcon } from 'lucide-react'
import { useState } from 'react'

import type { Option } from './multi-select-with-quantity'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { NumberInput } from './ui/number-input'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Separator } from './ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

type MultiselectItemProps = {
  quantity: number
  option: Option
  badgeClassName?: ClassValue
  disabled?: boolean
  onQuantityChange: (optionValue: string, newQuantity: number) => void
  onUnselect: (option: Option) => void
}

export function MultiselectItem({
  quantity: initialQuantity,
  option,
  badgeClassName,
  disabled = false,
  onQuantityChange,
  onUnselect,
}: MultiselectItemProps) {
  const [quantity, setQuantity] = useState(initialQuantity || 1)
  const [open, setOpen] = useState(false)

  return (
    <div
      key={option.value}
      className={cn(
        'animate-fadeIn bg-background text-foreground hover:bg-accent/50 relative inline-flex h-8',
        'cursor-default items-center rounded border border-border ps-3 pe-8 text-xs font-medium transition-all duration-200',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 data-fixed:pe-3',
        'divide-x divide-zinc-200',
        badgeClassName,
      )}
      data-fixed={option.fixed}
      data-disabled={disabled || undefined}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            onClick={(event) => event.stopPropagation()}
            className="flex items-center gap-1.5 hover:bg-accent/30 px-1.5 py-1 transition-all duration-200 cursor-pointer group -mx-1"
          >
            <span className="font-medium text-foreground group-hover:text-foreground/90">
              {option.label}
            </span>
            <Badge variant="secondary">
              <span className="tabular-nums">{option.quantity || 1}</span>
              <span className="text-[10px] opacity-80 font-normal">un.</span>
            </Badge>
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-80 p-0 border border-border/50 bg-background/90 backdrop-blur-md rounded"
          align="start"
          alignOffset={-9}
        >
          <div className="space-y-2">
            <div className="flex items-start gap-3 p-3">
              <div className="size-10 bg-muted/60 rounded flex items-center justify-center border border-border/40">
                <span className="text-base font-bold text-foreground">
                  {option.label.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 space-y-1">
                <Tooltip>
                  <TooltipTrigger>
                    <h4 className="font-semibold text-sm text-left leading-tight text-foreground line-clamp-1">
                      {option.label}
                    </h4>
                  </TooltipTrigger>
                  <TooltipContent>{option.label}</TooltipContent>
                </Tooltip>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  Ajuste a quantidade necessária para este produto
                </p>
              </div>
            </div>

            <div className="space-y-4 px-3 mb-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground">
                  Quantidade
                </label>
                <Badge>
                  Total: {option.quantity || 1} unidade
                  {(option.quantity || 1) !== 1 ? 's' : ''}
                </Badge>
              </div>

              <NumberInput
                value={quantity}
                onChange={(value) => setQuantity(value)}
              />
            </div>
            <Separator className="my-0 bg-border/40" />

            <div className="flex gap-3 p-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 h-9 text-xs font-medium rounded border-border/60 hover:bg-accent/50 transition-all duration-200"
                onClick={() => setQuantity(1)}
                disabled={disabled || (option.quantity || 1) === 1}
              >
                Resetar
              </Button>
              <Button
                type="button"
                size="sm"
                className="flex-1 h-9 text-xs font-medium rounded transition-all duration-200"
                onClick={() => {
                  onQuantityChange(option.value, quantity)
                  setOpen(false)
                }}
                disabled={disabled}
              >
                Aplicar
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <button
        className={cn(
          'text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10',
          'focus-visible:border-ring focus-visible:ring-ring/50 absolute -inset-y-px -end-px flex size-8 items-center',
          'justify-center rounded-e border border-transparent p-0 outline-hidden transition-all duration-200',
          'outline-none focus-visible:ring-[3px] group',
        )}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onUnselect(option)
          }
        }}
        onMouseDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onClick={() => onUnselect(option)}
        aria-label="Remove"
      >
        <XIcon
          size={14}
          aria-hidden="true"
          className="group-hover:scale-110 transition-transform duration-200"
        />
      </button>
    </div>
  )
}
