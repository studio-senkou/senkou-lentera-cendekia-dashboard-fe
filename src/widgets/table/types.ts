import type { ReactNode } from 'react'

import type { ColumnDef, RowData } from '@tanstack/react-table'

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Pin the column to an edge of the table while it scrolls. */
    fixed?: 'left' | 'right'
    /** Minimum width of the column, e.g. `'12rem'`. */
    minWidth?: string
  }
}

export interface TableProps<T> {
  columns: Array<ColumnDef<T, any>>
  data?: Array<T>
  caption?: string
  isLoading?: boolean
  skeletonRows?: number
  emptyMessage?: string
  pagination?: {
    currentPage: number
    pageSize: number
  }
  totalItems?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  /** Actions rendered on the right side of the search row. */
  toolbar?: ReactNode
}
