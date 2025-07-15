/**
 * Capitaliza a primeira letra de cada palavra usando regex.
 * @param value - The value to be formatted.
 * @returns The formatted value.
 */
export function formatStringToShow(value: string) {
  return value.replace(
    /\b\w+/g,
    (word) => word[0].toUpperCase() + word.slice(1).toLowerCase(),
  )
}

/**
 * Capitaliza a primeira letra de cada palavra usando split/map.
 * @param text - The text to be formatted.
 * @returns The formatted text.
 */
export function capitalizeTextSplit(text: string): string {
  return text
    .split(' ')
    .map((word) => {
      if (word.length === 0) return ''
      return word[0].toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(' ')
}
