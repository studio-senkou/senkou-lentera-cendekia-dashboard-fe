import { flexRender } from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { fixedRightHeaderClass, isFixedRightColumn } from '../utils'
import type { Table as TanstackTable } from '@tanstack/react-table'

import {
  TableHead,
  TableHeader as TableHeaderComponent,
  TableRow,
} from '@/shared/ui/table'
import { cn } from '@/shared/lib/utils'

interface TableHeaderProps<T> {
  table: TanstackTable<T>
  isLoading?: boolean
}

export function TableHeader<T>({ table, isLoading }: TableHeaderProps<T>) {
  return (
    <TableHeaderComponent>
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow key={headerGroup.id}>
          <TableHead className="w-16">No.</TableHead>
          {headerGroup.headers.map((header) => {
            const canSort = header.column.getCanSort() && !isLoading
            const sorted = header.column.getIsSorted()
            const isFixedRight = isFixedRightColumn(header.column)
            const minWidth = header.column.columnDef.meta?.minWidth

            return (
              <TableHead
                key={header.id}
                colSpan={header.colSpan}
                className={cn(isFixedRight && fixedRightHeaderClass)}
                style={minWidth ? { minWidth } : undefined}
              >
                {header.isPlaceholder ? null : (
                  <div
                    className={cn(
                      'flex items-center gap-1.5',
                      isFixedRight && 'justify-end',
                      canSort && 'cursor-pointer select-none',
                    )}
                    onClick={
                      canSort
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                  >
                    <span>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </span>
                    {canSort &&
                      (sorted === 'asc' ? (
                        <ArrowUp className="size-3.5 text-primary" />
                      ) : sorted === 'desc' ? (
                        <ArrowDown className="size-3.5 text-primary" />
                      ) : (
                        <ArrowUpDown className="size-3.5 text-muted-foreground" />
                      ))}
                  </div>
                )}
              </TableHead>
            )
          })}
        </TableRow>
      ))}
    </TableHeaderComponent>
  )
}
