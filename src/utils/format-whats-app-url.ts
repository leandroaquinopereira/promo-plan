export function formatWhatsAppUrl(phone: string) {
  const cleanPhone = phone.replace(/\D/g, '')

  return `https://wa.me/${cleanPhone}`
}
