import type { Tasting } from './tasting'
import type { TastingStatus } from './tasting'

export interface TastingLog {
  id: string
  tasting: Tasting
  status: TastingStatus
  createdAt: Date
  createdBy: string
}
