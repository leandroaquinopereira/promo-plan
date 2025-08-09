export enum ProductStatusEnum {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DELETED = 'deleted',
}

export interface Product {
  id: string
  name: string
  description: string
  status: ProductStatusEnum
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
}
