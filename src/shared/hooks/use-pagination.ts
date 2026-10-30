import { useCallback, useState } from 'react'
import type { PaginationState } from '@/shared/types/pagination'
import { DEFAULT_PAGE_SIZE } from '@/shared/types/pagination'

export function usePagination(initialPageSize: number = DEFAULT_PAGE_SIZE) {
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    pageSize: initialPageSize,
    totalItems: 0,
  })

  const limit = pagination.pageSize
  const offset = (pagination.currentPage - 1) * pagination.pageSize

  const setPage = useCallback((currentPage: number) => {
    setPagination((prev) => ({ ...prev, currentPage }))
  }, [])

  const setPageSize = useCallback((pageSize: number) => {
    setPagination((prev) => ({ ...prev, currentPage: 1, pageSize }))
  }, [])

  const setTotalItems = useCallback((totalItems: number) => {
    setPagination((prev) =>
      prev.totalItems === totalItems ? prev : { ...prev, totalItems },
    )
  }, [])

  return {
    pagination,
    setPagination,
    setPage,
    setPageSize,
    setTotalItems,
    limit,
    offset,
  }
}
