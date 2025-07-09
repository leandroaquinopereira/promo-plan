export function getTotalOfPages(total: number, itemsPerPage: number = 10) {
  const totalPages = Math.ceil(total / itemsPerPage)
  if (totalPages === 0) {
    return 1
  }

  return totalPages
}
