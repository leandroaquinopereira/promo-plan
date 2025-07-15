import { buildSeparator } from './build-value-for-combobox'

export function extractValueFromCombobox(value?: string) {
  const hasSeparatorInValue = value?.includes(buildSeparator)
  if (hasSeparatorInValue) {
    return value?.split(buildSeparator)[1]?.trim() || ''
  }

  return value || ''
}
