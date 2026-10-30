import { useEffect, useRef, useState } from 'react'

import { usePagination } from './use-pagination'

export const SEARCH_DEBOUNCE_MS = 400

/**
 * Combines server-side pagination with a debounced search term.
 * Committing a new search resets the table back to the first page.
 */
export function useServerTable() {
  const {
    pagination,
    setPagination,
    setPage,
    setPageSize,
    setTotalItems,
    limit,
    offset,
  } = usePagination()

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const committedSearch = useRef('')

  useEffect(() => {
    const timer = setTimeout(() => {
      const next = searchInput.trim()
      if (next === committedSearch.current) return

      committedSearch.current = next
      setSearch(next)
      setPage(1)
    }, SEARCH_DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [searchInput, setPage])

  return {
    pagination,
    setPagination,
    setPage,
    setPageSize,
    setTotalItems,
    limit,
    offset,
    searchInput,
    search,
    setSearchInput,
    params: {
      limit,
      offset,
      ...(search === '' ? {} : { search }),
    },
  }
}
