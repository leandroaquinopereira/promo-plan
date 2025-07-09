type BuildValueForComboboxParams = {
  value: string
  label: string
}

export const buildSeparator = '|==|'

export function buildValueForCombobox({
  value,
  label,
}: BuildValueForComboboxParams) {
  return `${label?.toLowerCase().trim()}${buildSeparator}${value?.trim()}`
}
