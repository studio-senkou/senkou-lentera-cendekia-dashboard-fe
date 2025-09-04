import { flexRender } from '@tanstack/react-table'
import {
  TableBody as TableBodyComponent,
  TableRow,
  TableCell,
} from '@/shared/ui/table'
import { type Table } from '@tanstack/react-table'
import { SkeletonRow } from './skeleton-row'

interface TableBodyProps<T> {
  table: Table<T>
  isLoading?: boolean
  skeletonRows?: number
  columnCount: number
}

export function TableBody<T>({
  table,
  isLoading,
  skeletonRows = 5,
  columnCount,
}: TableBodyProps<T>) {
  return (
    <TableBodyComponent>
      {isLoading ? (
        Array.from({ length: skeletonRows }).map((_, rIdx) => (
          <SkeletonRow key={rIdx} rowIndex={rIdx} columnCount={columnCount} />
        ))
      ) : table.getRowModel().rows.length > 0 ? (
        table.getRowModel().rows.map((row, index) => {
          return (
            <TableRow
              key={row.id}
              className="border-b transition-colors hover:bg-gray-100"
            >
              <TableCell key={row.id} className="p-4">
                {index + 1}
              </TableCell>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          )
        })
      ) : (
        <TableRow>
          <TableCell colSpan={columnCount + 1} className="text-center p-8">
            No data available
          </TableCell>
        </TableRow>
      )}
    </TableBodyComponent>
  )
}
