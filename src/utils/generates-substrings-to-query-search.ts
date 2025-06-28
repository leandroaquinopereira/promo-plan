import { normalizeText } from './normalize-text'

export const EMPTY_STRING = '__EMPTY__'

export function generateSubstrings(
  stringToGenerateSubstring: string,
  needsEmptyString = true,
): Set<string> {
  const substrings = new Set<string>()
  if (needsEmptyString) {
    substrings.add(EMPTY_STRING) // add nullish string
  }

  stringToGenerateSubstring = normalizeText(stringToGenerateSubstring)
  for (let i = 0; i < stringToGenerateSubstring.length; i++) {
    for (let j = i + 1; j < stringToGenerateSubstring.length + 1; j++) {
      substrings.add(stringToGenerateSubstring.slice(i, j))
    }
  }
  return substrings
}
