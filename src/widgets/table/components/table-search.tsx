import { Search, X } from 'lucide-react'

import { Input } from '@/shared/ui/input'
import { cn } from '@/shared/lib/utils'

interface TableSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function TableSearch({
  value,
  onChange,
  placeholder = 'Cari data…',
  className,
}: TableSearchProps) {
  return (
    <div className={cn('relative w-full sm:max-w-xs', className)}>
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          'pl-8 [&::-webkit-search-cancel-button]:hidden',
          value !== '' && 'pr-8',
        )}
      />
      {value !== '' && (
        <button
          type="button"
          aria-label="Hapus pencarian"
          onClick={() => onChange('')}
          className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}
