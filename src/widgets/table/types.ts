import { type ColumnDef } from '@tanstack/react-table'

export interface TableProps<T> {
  columns: ColumnDef<T, any>[]
  data: T[]
  caption?: string
  isLoading?: boolean
  skeletonRows?: number
}
