export enum GuideCategoryEnum {
  SETUP = 'setup',
  CHECKLIST = 'checklist',
  REPORTS = 'reports',
  PHOTO_EVIDENCES = 'photo_evidences',
  BEST_PRACTICES = 'best_practices',
}

export interface Guide {
  id: string
  title: string
  description: string
  category: GuideCategoryEnum
  lastUpdated: string
  content?: string
  updatedAt: Date
}
