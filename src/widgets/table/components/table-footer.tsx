import { TableFooter as TableFooterComponent, TableRow, TableCell } from '@/shared/ui/table'
import { type Table } from '@tanstack/react-table'
import { Pagination } from './pagination'

interface TableFooterProps<T> {
  table: Table<T>
  isLoading?: boolean
  columnCount: number
}

export function TableFooter<T>({ table, isLoading, columnCount }: TableFooterProps<T>) {
  return (
    <TableFooterComponent>
      <TableRow>
        <TableCell colSpan={columnCount + 1}>
          <Pagination table={table} isLoading={isLoading} />
        </TableCell>
      </TableRow>
    </TableFooterComponent>
  )
}
