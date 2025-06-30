export function cleanUserId(userId: string): string {
  return userId.trim().replace(/\D/g, '').replace(/\+55/g, '')
}
