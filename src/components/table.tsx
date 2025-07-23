import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
} from '@tanstack/react-table'
import {
  Table as TableComponent,
  TableCaption,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableFooter,
} from './ui/table'
import { rankItem } from '@tanstack/match-sorter-utils'
import { useState, useMemo } from 'react'

export interface TableProps<T> {
  columns: ColumnDef<T, any>[]
  data: T[]
  caption?: string
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({
    itemRank,
  })

  return itemRank.passed
}

export function Table<T>({ columns, data, caption }: TableProps<T>) {
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
    <TableComponent>
      {caption && <TableCaption>{caption}</TableCaption>}
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            <TableHead className="p-2 w-24">No.</TableHead>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id} colSpan={header.colSpan}>
                {header.isPlaceholder ? null : (
                  <>
                    <div
                      {...{
                        className: header.column.getCanSort()
                          ? 'cursor-pointer select-none hover:text-blue-400 transition-colors'
                          : '',
                        onClick: header.column.getToggleSortingHandler(),
                      }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {{
                        asc: ' 🔼',
                        desc: ' 🔽',
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  </>
                )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.length > 0 ? (
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
            <TableCell colSpan={columns.length + 1} className="text-center p-8">
              No data available
            </TableCell>
          </TableRow>
        )}
      </TableBody>

      <TableFooter>
        <TableRow>
          <TableCell colSpan={columns.length + 1}>
            <div className="flex items-center justify-between">
              <div>
                {table.getCanPreviousPage() && (
                  <button onClick={() => table.previousPage()} className="mr-2">
                    Previous
                  </button>
                )}
                {table.getCanNextPage() && (
                  <button onClick={() => table.nextPage()}>Next</button>
                )}
              </div>
              <div>
                Page {table.getState().pagination.pageIndex + 1} of{' '}
                {table.getPageCount()}
              </div>
            </div>
          </TableCell>
        </TableRow>
      </TableFooter>
    </TableComponent>
  )
}
