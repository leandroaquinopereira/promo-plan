'use client'

import { parseDate } from '@internationalized/date'
import { RangeCalendar } from '@promo/components/ui/calendar-rac'
import { DateInput, dateInputStyle } from '@promo/components/ui/datefield-rac'
import { cn } from '@promo/lib/utils'
import { CalendarIcon } from 'lucide-react'
import { forwardRef } from 'react'
import {
  Button,
  DateRangePicker as DateRangePickerRac,
  Dialog,
  Group,
  Popover,
} from 'react-aria-components'

export type DateRange = {
  start: Date | null
  end: Date | null
}

type RangeDatePickerProps = {
  value?: DateRange | null
  onChange?: (range: DateRange | null) => void
  placeholder?: {
    start?: string
    end?: string
  }
  disabled?: boolean
  className?: string
  error?: boolean
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
}

export const RangeDatePicker = forwardRef<HTMLDivElement, RangeDatePickerProps>(
  function RangeDatePicker(
    {
      value,
      onChange,
      placeholder = {
        start: 'Data inicial',
        end: 'Data final',
      },
      disabled = false,
      className,
      error = false,
      ...ariaProps
    },
    ref,
  ) {
    // Converte DateRange para o formato esperado pelo componente
    const getRangeValueFromDateRange = (
      range: DateRange | null | undefined,
    ) => {
      if (!range || !range.start || !range.end) return null

      try {
        const start = parseDate(range.start.toISOString().split('T')[0])
        const end = parseDate(range.end.toISOString().split('T')[0])

        return { start, end }
      } catch {
        return null
      }
    }

    // Converte o formato do componente para DateRange
    const getDateRangeFromRangeValue = (rangeValue: any): DateRange | null => {
      if (!rangeValue) return null

      try {
        const start = rangeValue.start
          ? new Date(rangeValue.start.toString())
          : null
        const end = rangeValue.end ? new Date(rangeValue.end.toString()) : null

        return { start, end }
      } catch {
        return null
      }
    }

    const handleRangeChange = (rangeValue: any) => {
      if (!onChange) return

      const convertedRange = getDateRangeFromRangeValue(rangeValue)
      onChange(convertedRange)
    }

    return (
      <DateRangePickerRac
        value={getRangeValueFromDateRange(value)}
        onChange={handleRangeChange}
        isDisabled={disabled}
        className={cn('w-full', className)}
        ref={ref}
        {...ariaProps}
      >
        <div className="flex w-full">
          <Group
            className={cn(
              dateInputStyle,
              'pe-9 dark:bg-input/30',
              error &&
                'border-destructive focus-within:border-destructive focus-within:ring-destructive/20',
            )}
          >
            <DateInput slot="start" unstyled />
            <span
              aria-hidden="true"
              className={cn(
                'text-muted-foreground/70 px-2',
                error && 'text-destructive/70',
              )}
            >
              -
            </span>
            <DateInput slot="end" unstyled />
          </Group>

          <Button
            className={cn(
              'text-muted-foreground/80 cursor-pointer hover:text-foreground z-10 -ms-9 -me-px flex w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none',
              'data-focus-visible:border-ring data-focus-visible:ring-ring/50 data-focus-visible:ring-[3px]',
              disabled && 'cursor-not-allowed opacity-50',
              error && 'text-destructive/80 hover:text-destructive',
            )}
            isDisabled={disabled}
          >
            <CalendarIcon size={16} />
          </Button>
        </div>

        <Popover
          className={cn(
            'bg-background text-popover-foreground z-50 rounded-md border shadow-lg outline-hidden',
            'data-entering:animate-in data-exiting:animate-out',
            'data-[entering]:fade-in-0 data-[exiting]:fade-out-0',
            'data-[entering]:zoom-in-95 data-[exiting]:zoom-out-95',
            'data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2',
            'data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2',
          )}
          offset={4}
        >
          <Dialog className="max-h-[inherit] overflow-auto p-2">
            <RangeCalendar />
          </Dialog>
        </Popover>
      </DateRangePickerRac>
    )
  },
)
