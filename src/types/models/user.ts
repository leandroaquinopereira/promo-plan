export type Role = {
  id: string
  name: string
  slug: string
  createdAt: Date
}

export enum UserSituationEnum {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DELETED = 'deleted',
}

export enum UserStatusEnum {
  ONLINE = 'online',
  OFFLINE = 'offline',
  WORKING = 'working',
}

export interface User {
  id: string
  name: string
  phone: string
  password: string
  email?: string
  role: Role
  active: boolean
  state: string
  city: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
  lastLoggedAt: Date
  avatar?: string
  situation: UserSituationEnum
  status: UserStatusEnum
}
