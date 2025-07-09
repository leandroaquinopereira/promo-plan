import type { Timestamp } from 'firebase/firestore'

/**
 * Converte uma data do Firebase (Timestamp) ou Date normal para Date
 * @param date - Data que pode ser um Timestamp do Firebase ou uma Date normal
 * @returns Date object
 */
export function convertFirebaseDate(date: Timestamp | Date | undefined): Date {
  if (!date) {
    return new Date()
  }

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

/**
 * Converte uma data do Firebase para formulário, ajustando para timezone local
 * Para evitar problemas de "um dia a mais" em DatePickers
 * @param date - Data que pode ser um Timestamp do Firebase ou uma Date normal
 * @returns Date object ajustada para timezone local
 */
export function convertFirebaseDateForForm(
  date: Timestamp | Date | undefined,
): Date {
  if (!date) {
    return new Date()
  }

  let resultDate: Date

  if (date instanceof Date) {
    resultDate = date
  } else if (date && typeof date === 'object' && 'toDate' in date) {
    // Se for um Timestamp do Firebase, usa toDate()
    resultDate = date.toDate()
  } else {
    // Fallback para Date atual se não conseguir converter
    resultDate = new Date()
  }

  // Cria uma nova data usando ano, mês e dia para evitar problemas de timezone
  // Isso garante que a data seja interpretada como timezone local
  const year = resultDate.getFullYear()
  const month = resultDate.getMonth()
  const day = resultDate.getDate()

  return new Date(year, month, day)
}
