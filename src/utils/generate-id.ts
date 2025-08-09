import { nanoid } from 'nanoid'

export function generateId(length: number = 16) {
  return nanoid(length)
}
