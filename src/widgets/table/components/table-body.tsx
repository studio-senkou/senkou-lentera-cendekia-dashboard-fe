import { flexRender } from '@tanstack/react-table'
import { Inbox } from 'lucide-react'

import { fixedRightBodyClass, isFixedRightColumn } from '../utils'
import { SkeletonRow } from './skeleton-row'
import type { Table as TanstackTable } from '@tanstack/react-table'
import { cn } from '@/shared/lib/utils'
import {
  TableBody as TableBodyComponent,
  TableCell,
  TableRow,
} from '@/shared/ui/table'

interface TableBodyProps<T> {
  table: TanstackTable<T>
  isLoading?: boolean
  skeletonRows?: number
  columnCount: number
  emptyMessage?: string
}

export function TableBody<T>({
  table,
  isLoading,
  skeletonRows = 5,
  columnCount,
  emptyMessage = 'Tidak ada data.',
}: TableBodyProps<T>) {
  const actionColumnIndex = table
    .getVisibleLeafColumns()
    .findIndex((column) => isFixedRightColumn(column))

  return (
    <TableBodyComponent>
      {isLoading ? (
        Array.from({ length: skeletonRows }).map((_, rIdx) => (
          <SkeletonRow
            key={rIdx}
            rowIndex={rIdx}
            columnCount={columnCount}
            fixedRightColumnIndex={actionColumnIndex}
          />
        ))
      ) : table.getRowModel().rows.length > 0 ? (
        table.getRowModel().rows.map((row, index) => (
          <TableRow key={row.id}>
            <TableCell className="w-16 text-muted-foreground">
              {table.getState().pagination.pageIndex *
                table.getState().pagination.pageSize +
                index +
                1}
            </TableCell>
            {row.getVisibleCells().map((cell) => {
              const minWidth = cell.column.columnDef.meta?.minWidth

              return (
                <TableCell
                  key={cell.id}
                  className={cn(
                    isFixedRightColumn(cell.column) && fixedRightBodyClass,
                  )}
                  style={minWidth ? { minWidth } : undefined}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              )
            })}
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={columnCount + 1} className="h-32 text-center">
            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Inbox className="size-6" />
              <span className="text-sm">{emptyMessage}</span>
            </div>
          </TableCell>
        </TableRow>
      )}
    </TableBodyComponent>
  )
}
