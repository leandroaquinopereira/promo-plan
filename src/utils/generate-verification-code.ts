import { randomInt } from 'crypto'

export async function generateVerificationCode(phoneNumber: string) {
  const hash =
    phoneNumber
      .match(/\d/g)
      ?.reduce((acc, digit) => acc + digit.charCodeAt(0), 0) ?? 0

  /*
   * Verification Code Generation Process:
   * 1. Previous line extracts all digits from phone number and sums their ASCII values
   *    e.g.: "123" = (49 + 50 + 51) = 150 (where 49 is ASCII for '1', etc)
   *
   * 2. seed = hash % 900000
   *    Ensures number stays within 0-899999 range
   *    e.g.: if hash = 1500000, seed = 600000
   *
   * 3. randomOffset = random number between 100000 and 999999
   *    Adds randomness to the verification code
   *
   * 4. verificationCode = ((seed + randomOffset + 100000) % 1000000).toString().padStart(6, '0')
   *    Combines seed and random offset, ensures 6 digits with leading zeros if needed
   *    e.g.: if seed = 600000, randomOffset = 234567
   *         (600000 + 234567 + 100000) % 1000000 = 934567
   *
   * This creates a pseudo-random 6-digit verification code using both
   * the phone number and a random component for added security
   */
  const seed = hash % 900000
  const randomOffset = randomInt(100000, 999999)
  const verificationCode = ((seed + randomOffset + 100000) % 1000000)
    .toString()
    .padStart(6, '0')

  return verificationCode
}
