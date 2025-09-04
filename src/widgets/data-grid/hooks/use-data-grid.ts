import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ColumnOrColumnGroup } from 'react-data-grid'
import type { ChangedRowField, DataGridChangedRow } from '../types'

export interface DataGridHookProps<T> {
  rows: Array<T>
  columns: ColumnOrColumnGroup<NoInfer<T>, unknown>[]
}

export interface RowsChangeResult<T> {
  changedRows: Array<T>
  changes: Array<DataGridChangedRow<T>>
}

export interface DataGridHookResult<T> {
  data: Array<T>
  handleRowsChange: (rows: Array<T>) => RowsChangeResult<T> | undefined
}

export const useDataGrid = <TData>({
  rows,
  columns,
}: DataGridHookProps<TData>): DataGridHookResult<TData> => {
  const [data, setData] = useState<Array<TData>>(rows)
  const originalRowsRef = useRef<Array<TData>>(rows)

  useEffect(() => {
    originalRowsRef.current = rows
    setData(rows)
  }, [rows])

  const columnKeys = useMemo(() => {
    return columns
      .filter((col): col is any => 'key' in col)
      .map((col) => col.key as keyof TData)
  }, [columns])

  const handleRowsChange = useCallback(
    (newRows: Array<TData>): RowsChangeResult<TData> | undefined => {
      const originalRows = originalRowsRef.current

      if (newRows === originalRows) return

      const changedRows: Array<TData> = []
      const changes: Array<DataGridChangedRow<TData>> = []

      for (let i = 0; i < newRows.length; i++) {
        const newRow = newRows[i]
        const originalRow = originalRows[i]

        if (!originalRow) continue

        const fieldChanges: Record<string, ChangedRowField> = {}
        let hasChanges = false

        for (const key of columnKeys) {
          const oldValue = originalRow[key]
          const newValue = newRow[key]

          if (oldValue !== newValue) {
            fieldChanges[key as string] = {
              oldValue,
              newValue,
            }
            hasChanges = true
          }
        }

        if (hasChanges) {
          changedRows.push(newRow)
          changes.push({
            index: i,
            row: newRow,
            field: fieldChanges,
          })
        }
      }

      setData(newRows)

      return { changedRows, changes }
    },
    [],
  )

  return { data, handleRowsChange }
}
