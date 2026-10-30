import { ArrowUpRight, TrendingUp } from 'lucide-react'
import { Skeleton } from '@/shared/ui/skeleton'
import { cn } from '@/shared/lib/utils'

export interface StatCardProps {
  title: string
  value: string | number
  onClick?: () => void
  loading?: boolean
  variant?: 'solid' | 'plain'
  note?: string
}

export const StatCard = ({
  title,
  value,
  loading = false,
  variant = 'plain',
  note,
  onClick,
}: StatCardProps) => {
  const solid = variant === 'solid'

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border bg-card p-5 shadow-xs transition-colors',
        solid ? 'border-primary/15' : 'border-border',
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col">
          <div className="text-sm font-medium text-muted-foreground">
            {title}
          </div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            {loading ? (
              <Skeleton className="h-9 w-24" />
            ) : typeof value === 'number' ? (
              value.toLocaleString()
            ) : (
              value
            )}
          </div>
        </div>
        <button
          type="button"
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors',
            solid
              ? 'bg-primary/10 text-primary hover:bg-primary/15'
              : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground',
            onClick ? 'cursor-pointer' : 'cursor-default',
          )}
          onClick={onClick}
          aria-label={`Buka ${title}`}
          tabIndex={onClick ? 0 : -1}
        >
          <ArrowUpRight size={16} />
        </button>
      </div>
      {note && (
        <div className="mt-6">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-600/15 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-400/20">
            <TrendingUp className="h-3 w-3" />
            {note}
          </span>
        </div>
      )}
    </div>
  )
}
