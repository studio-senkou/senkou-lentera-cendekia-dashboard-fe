import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
} from '@tanstack/react-table'
import { Table as TableComponent, TableCaption } from '@/shared/ui/table'
import { useState, useMemo } from 'react'
import { TableHeader } from './components/table-header'
import { TableBody } from './components/table-body'
import { TableFooter } from './components/table-footer'
import { fuzzyFilter } from './utils'
import { type TableProps } from './types'

export function Table<T>({
  columns,
  data,
  caption,
  isLoading = false,
  skeletonRows = 5,
}: TableProps<T>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const safeData = useMemo(() => data || [], [data])

  const table = useReactTable({
    data: safeData,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      columnFilters,
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <TableComponent aria-busy={isLoading} aria-live="polite">
      {caption && <TableCaption>{caption}</TableCaption>}
      <TableHeader table={table} isLoading={isLoading} />
      <TableBody
        table={table}
        isLoading={isLoading}
        skeletonRows={skeletonRows}
        columnCount={columns.length}
      />
      <TableFooter
        table={table}
        isLoading={isLoading}
        columnCount={columns.length}
      />
    </TableComponent>
  )
}
