import { formatPhoneNumber } from '@promo/utils/format-phone-number'
import { ChangeEvent, type ComponentProps } from 'react'

import { Input } from './ui/input'

type PhoneNumberFieldProps = Omit<ComponentProps<'input'>, 'onChange'> & {
  onChange?: (value: string) => void
}

export function PhoneNumberField({
  className,
  onChange,
  ...props
}: PhoneNumberFieldProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const formattedValue = formatPhoneNumber(event.target.value)

    onChange?.(formattedValue)
  }

  return (
    <Input
      className={className}
      type="tel"
      onChange={handleChange}
      {...props}
    />
  )
}
