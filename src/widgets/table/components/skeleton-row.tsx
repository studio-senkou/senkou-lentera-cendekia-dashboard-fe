import { fixedRightBodyClass } from '../utils'
import { Skeleton } from '@/shared/ui/skeleton'
import { TableCell, TableRow } from '@/shared/ui/table'
import { cn } from '@/shared/lib/utils'

interface SkeletonRowProps {
  rowIndex: number
  columnCount: number
  fixedRightColumnIndex?: number
}

export function SkeletonRow({
  rowIndex,
  columnCount,
  fixedRightColumnIndex = -1,
}: SkeletonRowProps) {
  return (
    <TableRow>
      <TableCell className="w-16">
        <Skeleton className="h-4 w-6" />
      </TableCell>
      {Array.from({ length: columnCount }).map((_, cellIndex) => (
        <TableCell
          key={`skeleton-cell-${rowIndex}-${cellIndex}`}
          className={cn(
            cellIndex === fixedRightColumnIndex && fixedRightBodyClass,
          )}
        >
          <Skeleton className="h-6 w-full" />
        </TableCell>
      ))}
    </TableRow>
  )
}
