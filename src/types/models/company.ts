export enum CompanyStatusEnum {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export interface Company {
  id: string
  name: string
  status: CompanyStatusEnum
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
}
