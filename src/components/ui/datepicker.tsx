'use client'

import { Button } from '@promo/components/ui/button'
import { Calendar } from '@promo/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@promo/components/ui/popover'
import { dayjsApi } from '@promo/lib/dayjs'
import { cn } from '@promo/lib/utils'
import { Calendar as CalendarIcon } from 'lucide-react'
import * as React from 'react'

type DatePickerProps = {
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  disabled?: boolean
}

export function ShadcnUIDatePicker({
  selected,
  onSelect,
  disabled,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!selected}
          className={cn(
            'data-[empty=true]:text-muted-foreground w-[280px] justify-start text-left font-normal',
            'w-full',
          )}
          disabled={disabled}
        >
          <CalendarIcon />
          {selected ? (
            dayjsApi(selected).format('MMMM D, YYYY')
          ) : (
            <span>Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={selected} onSelect={onSelect} />
      </PopoverContent>
    </Popover>
  )
}
