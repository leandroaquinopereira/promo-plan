'use client'

import { CalendarDate, parseDate } from '@internationalized/date'
import { Calendar } from '@promo/components/ui/calendar-rac'
import { DateInput } from '@promo/components/ui/datefield-rac'
import { cn } from '@promo/lib/utils'
import { CalendarIcon } from 'lucide-react'
import { forwardRef } from 'react'
import {
  Button,
  DatePicker as DatePickerRac,
  type DateValue,
  Dialog,
  Group,
  Popover,
} from 'react-aria-components'

type DatePickerProps = {
  value?: Date | null
  onChange?: (date: Date | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  error?: boolean
  /** Container element for the popover portal (useful for modals) */
  portalContainer?: Element | null
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
}

export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(
  function DatePicker(
    {
      value,
      onChange,
      placeholder = 'Selecione uma data',
      disabled = false,
      className,
      error = false,
      ...ariaProps
    },
    ref,
  ) {
    // Converte Date para CalendarDate (formato do react-aria-components)
    const getCalendarDateFromDate = (
      date: Date | null,
    ): CalendarDate | null => {
      if (!date) {
        return null
      }

      try {
        const isoString = date.toISOString().split('T')[0]
        return parseDate(isoString)
      } catch {
        return null
      }
    }

    // Converte CalendarDate para Date
    const getDateFromCalendarDate = (
      dateValue: DateValue | null,
    ): Date | null => {
      if (!dateValue) return null

      try {
        return new Date(
          dateValue.year,
          dateValue.month - 1,
          dateValue.day,
          12,
          0,
          0,
          0,
        )
      } catch {
        return null
      }
    }

    const handleDateChange = (dateValue: DateValue | null) => {
      if (!onChange) {
        return
      }

      const convertedDate = getDateFromCalendarDate(dateValue)
      onChange(convertedDate)
    }

    return (
      <DatePickerRac
        value={getCalendarDateFromDate(value || null)}
        onChange={handleDateChange}
        isDisabled={disabled}
        className={cn('w-full', className)}
        ref={ref}
        {...ariaProps}
      >
        <div className="flex w-full">
          <Group className="w-full">
            <DateInput
              className={cn(
                'pe-9',
                error && 'border-destructive focus-visible:ring-destructive',
              )}
            />
          </Group>
          <Button
            className={cn(
              'cursor-pointer text-muted-foreground/80 hover:text-foreground z-10 -ms-9 -me-px flex w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none',
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
            'bg-background text-popover-foreground z-[9999] rounded-lg border shadow-lg outline-hidden',
            'data-entering:animate-in data-exiting:animate-out',
            'data-[entering]:fade-in-0 data-[exiting]:fade-out-0',
            'data-[entering]:zoom-in-95 data-[exiting]:zoom-out-95',
            'data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2',
            'data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2',
            'z-[9999999999]',
          )}
          offset={4}
          containerPadding={20}
        >
          <Dialog className="max-h-[inherit] overflow-auto p-2">
            <Calendar />
          </Dialog>
        </Popover>
      </DatePickerRac>
    )
  },
)
