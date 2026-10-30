import { Pagination } from './pagination'
import type { Table as TanstackTable } from '@tanstack/react-table'

interface TableFooterProps<T> {
  table: TanstackTable<T>
  isLoading?: boolean
}

export function TableFooter<T>({ table, isLoading }: TableFooterProps<T>) {
  const { pageIndex, pageSize } = table.getState().pagination
  const totalItems = table.getPrePaginationRowModel().rows.length

  return (
    <Pagination
      currentPage={pageIndex + 1}
      pageSize={pageSize}
      totalItems={totalItems}
      isLoading={isLoading}
      onPageChange={(page) => table.setPageIndex(page - 1)}
      onPageSizeChange={(size) => table.setPageSize(size)}
    />
  )
}
