type CreateObjectWithCommonValuesParams<TExtraValues> = {
  row: number
  createdBy: string
  updatedBy: string
  searchQuery: string[]
  status: string
} & TExtraValues

type CreateObjectWithCommonValuesReturn<TExtraValues> =
  CreateObjectWithCommonValuesParams<TExtraValues> & {
    createdAt: number
    updatedAt: number
  }

export class CreateObjectWithCommonValues {
  static create<TExtraValues>(
    values: CreateObjectWithCommonValuesParams<TExtraValues>,
  ): CreateObjectWithCommonValuesReturn<TExtraValues> {
    return {
      ...values,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
  }
}
