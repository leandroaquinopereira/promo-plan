import type { Timestamp } from 'firebase/firestore'

/**
 * Converte uma data do Firebase (Timestamp) ou Date normal para Date
 * @param date - Data que pode ser um Timestamp do Firebase ou uma Date normal
 * @returns Date object
 */
export function convertFirebaseDate(date: Timestamp | Date): Date {
  if (date instanceof Date) {
    return date
  }

  // Se for um Timestamp do Firebase, usa toDate()
  if (date && typeof date === 'object' && 'toDate' in date) {
    return date.toDate()
  }

  // Fallback para Date atual se não conseguir converter
  return new Date()
}
