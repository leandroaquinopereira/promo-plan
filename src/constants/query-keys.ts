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
    }
  }
}
