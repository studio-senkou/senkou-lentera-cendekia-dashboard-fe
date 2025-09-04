import { TableRow, TableCell } from '@/shared/ui/table'
import { Skeleton } from '@/shared/ui/skeleton'

interface SkeletonRowProps {
  rowIndex: number
  columnCount: number
}

export function SkeletonRow({ rowIndex, columnCount }: SkeletonRowProps) {
  const widths = ['w-20', 'w-28', 'w-24', 'w-32']

  return (
    <TableRow key={`skeleton-row-${rowIndex}`} className="border-b">
      <TableCell className="p-4">
        <Skeleton className="h-4 w-6" />
      </TableCell>
      {Array.from({ length: columnCount }).map((__, cIdx) => {
        const w = widths[cIdx % widths.length]
        return (
          <TableCell key={`skeleton-cell-${rowIndex}-${cIdx}`}>
            <Skeleton className={`h-4 ${w}`} />
          </TableCell>
        )
      })}
    </TableRow>
  )
}
