'use client'

import { Button } from '@promo/components/ui/button'
import { CardFooter } from '@promo/components/ui/card'
import { appConfiguration } from '@promo/constants/app-configuration'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { parseAsInteger, useQueryState } from 'nuqs'

interface ListPaginationSectionProps {
  totalTasks: number
  totalTasksShowing?: number
  itemsPerPage?: number
}

export function ListPaginationSection({
  totalTasks = 0,
  totalTasksShowing = 0,
  itemsPerPage = appConfiguration.listItemsPerPage,
}: ListPaginationSectionProps) {
  const [currentPage, setCurrentPage] = useQueryState(
    'current-page',
    parseAsInteger.withDefault(1),
  )

  const totalPages = Math.ceil(totalTasks / itemsPerPage)
  const hasPreviousPage = currentPage > 1
  const hasNextPage = currentPage < totalPages

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
    const maxVisiblePages = 5
    const pages: number[] = []

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      const startPage = Math.max(1, currentPage - 2)
      const endPage = Math.min(totalPages, currentPage + 2)

      if (startPage > 1) {
        pages.push(1)
        if (startPage > 2) {
          pages.push(-1) // Represents "..."
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push(-1) // Represents "..."
        }
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <CardFooter className="flex items-center justify-between p-0 border-t flex-wrap gap-4">
      <div className="text-sm text-muted-foreground">
        Mostrando {totalTasksShowing} de {totalTasks} tarefas
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
          {getVisiblePages().map(function (page, index) {
            if (page === -1) {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="text-sm text-muted-foreground px-2"
                >
                  ...
                </span>
              )
            }
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
