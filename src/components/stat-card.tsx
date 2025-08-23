import { ArrowUpRight, TrendingUp } from 'lucide-react'
import { Skeleton } from './ui/skeleton'
import { cn } from '@/lib/utils'

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
      className={`relative overflow-hidden rounded-2xl p-5 border shadow-sm ${
        solid
          ? 'bg-emerald-600 text-white border-transparent'
          : 'bg-white text-gray-900 border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <div
            className={`text-sm font-medium ${solid ? 'text-white/90' : 'text-gray-600'}`}
          >
            {title}
          </div>
          <div className="mt-2 text-4xl font-semibold">
            {loading ? (
              <Skeleton className="h-9 w-24" />
            ) : typeof value === 'number' ? (
              value.toLocaleString()
            ) : (
              (value ?? '-')
            )}
          </div>
        </div>
        <div
          className={cn(
            'h-8 w-8 flex items-center justify-center rounded-full',
            onClick && 'cursor-pointer hover:scale-105 transition-transform',
            solid ? 'bg-white/20' : 'bg-gray-100',
          )}
          onClick={onClick}
          aria-hidden
        >
          <ArrowUpRight
            className={solid ? 'text-white' : 'text-gray-700'}
            size={16}
          />
        </div>
      </div>
      {note && (
        <div className="mt-6">
          <span
            className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${solid ? 'bg-emerald-700/50 text-white/90' : 'bg-gray-100 text-gray-700'}`}
          >
            <TrendingUp className="h-3 w-3" />
            {note}
          </span>
        </div>
      )}
    </div>
  )
}
