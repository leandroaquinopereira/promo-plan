'use client'

import { Button } from '@promo/components/ui/button'
import { CardFooter } from '@promo/components/ui/card'
import { appConfiguration } from '@promo/constants/app-configuration'
import { getTotalOfPages } from '@promo/utils/get-total-of-pages'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { parseAsInteger, useQueryState } from 'nuqs'

type ListPaginationSectionProps = {
  totalUsers: number
  totalUsersShowing: number
  itemsPerPage?: number
}

export function ListPaginationSection({
  totalUsers = 0,
  totalUsersShowing = 0,
  itemsPerPage = appConfiguration.listItemsPerPage,
}: ListPaginationSectionProps) {
  const [currentPage, setCurrentPage] = useQueryState(
    'current-page',
    parseAsInteger.withDefault(1),
  )
  const totalPages = getTotalOfPages(totalUsers, itemsPerPage)
  const hasNextPage = currentPage < totalPages
  const hasPreviousPage = currentPage > 1

  function handlePreviousPage() {
    if (hasPreviousPage) {
      setCurrentPage(currentPage - 1)
    }
  }

  function handleNextPage() {
    if (hasNextPage) {
      setCurrentPage(currentPage + 1)
    }
  }

  function handlePageClick(page: number) {
    setCurrentPage(page)
  }

  function getVisiblePages() {
    const pages = []
    const maxVisiblePages = 3

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 2) {
        pages.push(1, 2, 3)
      } else if (currentPage >= totalPages - 1) {
        pages.push(totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(currentPage - 1, currentPage, currentPage + 1)
      }
    }

    return pages
  }

  return (
    <CardFooter className="flex items-center justify-between p-0 border-t flex-wrap gap-4">
      <div className="text-sm text-muted-foreground">
        Mostrando {totalUsersShowing} de {totalUsers} usuários
      </div>
      <div className="flex items-center gap-2 w-full justify-center @lg:w-auto">
        <Button
          variant="outline"
          size="sm"
          disabled={!hasPreviousPage}
          onClick={handlePreviousPage}
        >
          <ChevronLeft className="size-4" />
          Anterior
        </Button>
        <div className="flex items-center gap-1">
          {getVisiblePages().map(function (page) {
            return (
              <Button
                key={page}
                variant={page === currentPage ? 'default' : 'outline'}
                size="sm"
                onClick={function () {
                  handlePageClick(page)
                }}
              >
                {page}
              </Button>
            )
          })}
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={!hasNextPage}
          onClick={handleNextPage}
        >
          Próximo
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </CardFooter>
  )
}
