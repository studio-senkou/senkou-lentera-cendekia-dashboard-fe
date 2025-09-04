import { cn } from '@/shared/lib/utils'
import { useCallback } from 'react'
import {
  DataGrid as DataGridComponent,
  type ColumnOrColumnGroup,
  type DataGridProps,
} from 'react-data-grid'
import 'react-data-grid/lib/styles.css'
import { useDataGrid } from './hooks/use-data-grid'
import type { DataGridChangedRow } from './types'

export interface DataGridComponentProps<TData> extends DataGridProps<TData> {
  rows: Array<TData>
  columns: Array<ColumnOrColumnGroup<TData, unknown>>
  onRowsDataChange?: (
    rows: Array<TData>,
    changes: Array<DataGridChangedRow<TData>>,
  ) => void
  enableVariableRowHeight?: boolean
  estimatedRowHeight?: number
}

export function DataGrid<T>({
  rows,
  columns,
  className,
  onRowsDataChange,
  enableVariableRowHeight = false,
  estimatedRowHeight = 40,
  ...props
}: DataGridComponentProps<T>) {
  const { data, handleRowsChange } = useDataGrid<T>({ rows, columns })

  const onRowsChange = useCallback(
    (rows: Array<T>) => {
      const result = handleRowsChange(rows)
      if (result && 'changes' in result && 'changedRows' in result) {
        const { changedRows, changes } = result
        onRowsDataChange?.(changedRows, changes)
      } else {
        onRowsDataChange?.(rows, [])
      }
    },
    [handleRowsChange, onRowsDataChange],
  )

  const getRowHeight = useCallback(
    (row: T) => {
      if (!enableVariableRowHeight) {
        return estimatedRowHeight
      }

      const contentLengths = columns
        .filter((col): col is any => 'key' in col)
        .map((col) => {
          const key = col.key as keyof T
          const value = row[key]
          return String(value || '').length
        })

      const maxLength = Math.max(...contentLengths)

      const baseHeight = 40
      const additionalHeight = Math.floor(maxLength / 50) * 20 // ~20px per 50 characters

      return Math.max(baseHeight, Math.min(baseHeight + additionalHeight, 120)) // Max 120px
    },
    [columns, enableVariableRowHeight, estimatedRowHeight],
  )

  return (
    <DataGridComponent
      columns={columns}
      rows={data}
      // rowKeyGetter={(row: any) => row.id}
      onRowsChange={onRowsChange}
      className={cn('data-grid-container rdg-light', className)}
      rowHeight={enableVariableRowHeight ? getRowHeight : estimatedRowHeight}
      {...props}
    />
  )
}
