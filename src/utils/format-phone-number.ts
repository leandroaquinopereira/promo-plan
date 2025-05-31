export function formatPhoneNumber(phoneNumber: string) {
  let numbers = phoneNumber.replace(/\D/g, '')

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
