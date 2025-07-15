import { Skeleton } from './ui/skeleton'
import { TableCell, TableRow } from './ui/table'

type TableSkeletonProps = {
  quantity?: number
}

export function TableSkeleton({ quantity = 5 }: TableSkeletonProps) {
  return Array.from({ length: 5 }).map((_, index) => (
    <TableRow key={index}>
      <TableCell>
        <Skeleton className="h-4 w-4 rounded" />
      </TableCell>
      {Array.from({ length: quantity }).map((_, index) => (
        <TableCell key={index}>
          <Skeleton className="h-3 w-20" />
        </TableCell>
      ))}
      <TableCell>
        <div className="flex items-center gap-1">
          <Skeleton className="h-6 w-6 rounded" />
          {/* <LoaderPinwheel className="size-4 animate-spin text-muted-foreground" /> */}
        </div>
      </TableCell>
    </TableRow>
  ))
}
