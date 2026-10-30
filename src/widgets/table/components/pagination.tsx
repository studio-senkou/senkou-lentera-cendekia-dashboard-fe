import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'

import { Button } from '@/shared/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { cn } from '@/shared/lib/utils'
import { PAGE_SIZES } from '@/shared/types/pagination'

interface PaginationProps {
  currentPage: number
  pageSize: number
  totalItems: number
  isLoading?: boolean
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

function getPageRange(
  current: number,
  totalPages: number,
  totalSlots = 7,
): Array<number | 'left' | 'right'> {
  if (totalPages <= totalSlots) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const leftSibling = Math.max(current - 1, 1)
  const rightSibling = Math.min(current + 1, totalPages)
  const showLeftDots = leftSibling > 2
  const showRightDots = rightSibling < totalPages - 1
  const capped = Math.max(1, totalSlots - 2)

  if (!showLeftDots && showRightDots) {
    return [
      ...Array.from({ length: capped }, (_, index) => index + 1),
      'right',
      totalPages,
    ]
  }

  if (showLeftDots && !showRightDots) {
    return [
      1,
      'left',
      ...Array.from(
        { length: capped },
        (_, index) => totalPages - capped + 1 + index,
      ),
    ]
  }

  if (showLeftDots && showRightDots) {
    return [1, 'left', leftSibling, current, rightSibling, 'right', totalPages]
  }

  return Array.from({ length: totalPages }, (_, index) => index + 1)
}

export function Pagination({
  currentPage,
  pageSize,
  totalItems,
  isLoading = false,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const end = Math.min(currentPage * pageSize, totalItems)

  const jump = (direction: 'left' | 'right') => {
    const next =
      direction === 'left'
        ? Math.max(1, currentPage - 5)
        : Math.min(totalPages, currentPage + 5)
    onPageChange(next)
  }

  return (
    <div className="flex flex-col items-center justify-between gap-3 lg:flex-row">
      <div className="text-sm text-muted-foreground">
        {isLoading
          ? 'Memuat…'
          : `Menampilkan ${start} sampai ${end} dari ${totalItems} data`}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={String(pageSize)}
          onValueChange={(value) => onPageSizeChange(Number(value))}
          disabled={isLoading}
        >
          <SelectTrigger
            className="h-9 w-auto min-w-20"
            aria-label="Baris per halaman"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size} / hal
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="size-9 p-0"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isLoading || currentPage <= 1}
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft className="size-4" />
        </Button>

        <div className="flex items-center gap-1">
          {getPageRange(currentPage, totalPages).map((page) =>
            page === 'left' || page === 'right' ? (
              <Button
                key={`dots-${page}`}
                type="button"
                variant="outline"
                size="sm"
                className="min-w-9 px-2"
                onClick={() => jump(page)}
                disabled={isLoading}
                title={page === 'left' ? 'Kembali 5 halaman' : 'Maju 5 halaman'}
                aria-label={
                  page === 'left' ? 'Kembali 5 halaman' : 'Maju 5 halaman'
                }
              >
                {page === 'left' ? (
                  <ChevronsLeft className="size-4" />
                ) : (
                  <ChevronsRight className="size-4" />
                )}
              </Button>
            ) : (
              <Button
                key={page}
                type="button"
                variant={page === currentPage ? 'default' : 'outline'}
                size="sm"
                className={cn('min-w-9 px-2')}
                onClick={() => onPageChange(page)}
                disabled={isLoading}
              >
                {page}
              </Button>
            ),
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="size-9 p-0"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLoading || currentPage >= totalPages}
          aria-label="Halaman berikutnya"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
