type UserListQueryParams = {
  search?: string
  state?: string
  permission?: string
  status?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export class QueryKeys {
  static get products() {
    return {
      multiselect: (query: string) => ['multiselect', 'products', query],
    }
  }

  static get users() {
    return {
      list: (params: UserListQueryParams) => {
        const {
          search,
          state,
          permission,
          status,
          page = 1,
          limit = 10,
          sortBy = 'name',
          sortOrder = 'asc',
        } = params
        return [
          'users',
          search,
          state,
          permission,
          status,
          page,
          limit,
          sortBy,
          sortOrder,
        ]
      },
      combobox: (query: string, entity: string) => [
        'users',
        'combobox',
        query,
        entity,
      ],
    }
  }
}
