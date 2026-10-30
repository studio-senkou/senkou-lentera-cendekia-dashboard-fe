export interface PaginationParams {
  limit: number
  offset: number
  search?: string
}

export interface PaginationState {
  currentPage: number
  pageSize: number
  totalItems: number
}

export interface PaginationMeta {
  total: number
  limit: number
  offset: number
}

export interface CursorPaginationMeta {
  total: number
  limit: number
  next_cursor: number | null
  has_more: boolean
}

export const DEFAULT_PAGE_SIZE = 10

export const PAGE_SIZES = [10, 20, 50, 100]
