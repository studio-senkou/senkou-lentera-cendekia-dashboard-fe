import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useState } from 'react'

import { Pagination } from './components/pagination'
import { TableBody } from './components/table-body'
import { TableFooter } from './components/table-footer'
import { TableHeader } from './components/table-header'
import { TableSearch } from './components/table-search'
import { fuzzyFilter, globalFuzzyFilter } from './utils'
import type { TableProps } from './types'
import type { ColumnFiltersState } from '@tanstack/react-table'

import { TableCaption, Table as TableComponent } from '@/shared/ui/table'

export { TableSearch } from './components/table-search'
export { RowActions } from './components/row-actions'
export type {
  RowAction,
  RowActionOverflow,
  RowActionsProps,
} from './components/row-actions'

export function Table<T>({
  columns,
  data = [],
  caption,
  isLoading = false,
  skeletonRows = 5,
  emptyMessage = 'Tidak ada data.',
  pagination,
  totalItems = 0,
  onPageChange,
  onPageSizeChange,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  toolbar,
}: TableProps<T>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [localSearch, setLocalSearch] = useState('')
  const isServerPaginated =
    pagination !== undefined && onPageChange !== undefined
  const isControlledSearch = onSearchChange !== undefined
  const searchTerm = isControlledSearch ? (searchValue ?? '') : localSearch
  const handleSearchChange = onSearchChange ?? setLocalSearch

  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    globalFilterFn: globalFuzzyFilter,
    state: {
      columnFilters,
      ...(isControlledSearch ? {} : { globalFilter: localSearch }),
      ...(isServerPaginated
        ? {
            pagination: {
              pageIndex: pagination.currentPage - 1,
              pageSize: pagination.pageSize,
            },
          }
        : {}),
    },
    onColumnFiltersChange: setColumnFilters,
    manualPagination: isServerPaginated,
    pageCount: isServerPaginated
      ? Math.max(1, Math.ceil(totalItems / pagination.pageSize))
      : undefined,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className="flex w-full min-w-0 flex-col gap-3">
      <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <TableSearch
          value={searchTerm}
          onChange={handleSearchChange}
          {...(searchPlaceholder === undefined
            ? {}
            : { placeholder: searchPlaceholder })}
        />
        {toolbar !== undefined && (
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            {toolbar}
          </div>
        )}
      </div>
      <TableComponent
        aria-busy={isLoading}
        aria-live="polite"
        containerClassName="max-h-[58vh] overflow-auto scroll-pt-11"
      >
        {caption && <TableCaption>{caption}</TableCaption>}
        <TableHeader table={table} isLoading={isLoading} />
        <TableBody
          table={table}
          isLoading={isLoading}
          skeletonRows={skeletonRows}
          columnCount={columns.length}
          emptyMessage={emptyMessage}
        />
      </TableComponent>
      {isServerPaginated ? (
        <Pagination
          currentPage={pagination.currentPage}
          pageSize={pagination.pageSize}
          totalItems={totalItems}
          isLoading={isLoading}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange ?? (() => undefined)}
        />
      ) : (
        <TableFooter table={table} isLoading={isLoading} />
      )}
    </div>
  )
}
