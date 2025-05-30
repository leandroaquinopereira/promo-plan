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
  const formatPhoneNumber = (value: string) => {
    let numbers = value.replace(/\D/g, '')

    if (numbers.length > 10) {
      numbers = numbers.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    } else if (numbers.length > 6) {
      numbers = numbers.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
    } else if (numbers.length > 2) {
      numbers = numbers.replace(/^(\d{2})(\d{0,5})/, '($1) $2')
    } else {
      numbers = numbers
    }

    return numbers
  }

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
