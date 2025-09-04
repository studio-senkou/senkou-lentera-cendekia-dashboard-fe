import { type Table } from '@tanstack/react-table'

interface PaginationProps<T> {
  table: Table<T>
  isLoading?: boolean
}

export function Pagination<T>({ table, isLoading }: PaginationProps<T>) {
  return (
    <div className="flex items-center justify-between">
      <div>
        {table.getCanPreviousPage() && (
          <button
            onClick={() => table.previousPage()}
            className="mr-2"
            disabled={isLoading}
          >
            Previous
          </button>
        )}
        {table.getCanNextPage() && (
          <button onClick={() => table.nextPage()} disabled={isLoading}>
            Next
          </button>
        )}
      </div>
      <div>
        {isLoading ? (
          'Loading…'
        ) : (
          <>
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </>
        )}
      </div>
    </div>
  )
}
