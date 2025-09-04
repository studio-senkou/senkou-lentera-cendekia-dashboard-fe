import { flexRender } from '@tanstack/react-table'
import { TableHeader as TableHeaderComponent, TableRow, TableHead } from '@/shared/ui/table'
import { type Table } from '@tanstack/react-table'

interface TableHeaderProps<T> {
  table: Table<T>
  isLoading?: boolean
}

export function TableHeader<T>({ table, isLoading }: TableHeaderProps<T>) {
  return (
    <TableHeaderComponent>
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
                        ? `select-none transition-colors ${isLoading ? 'text-muted-foreground' : 'cursor-pointer hover:text-blue-400'}`
                        : '',
                      onClick: isLoading
                        ? undefined
                        : header.column.getToggleSortingHandler(),
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
    </TableHeaderComponent>
  )
}
