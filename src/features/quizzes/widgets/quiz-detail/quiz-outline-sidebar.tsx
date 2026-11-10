import { Loader2 } from 'lucide-react'

import type { QuizQuestion } from '@/shared/types/response'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'

interface QuizOutlineSidebarProps {
  questions: QuizQuestion[]
  selectedId: number | null
  onSelect: (id: number) => void
  totalQuestions: number
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  fetchNextPage?: () => void
}

export function QuizOutlineSidebar({
  questions,
  selectedId,
  onSelect,
  totalQuestions,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: QuizOutlineSidebarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
      {/* Outline Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-xl font-medium text-slate-900">Outline</h3>
          <p className="text-sm text-muted-foreground">
            {totalQuestions} pertanyaan kuis
          </p>
        </div>
      </div>

      {/* Questions list */}
      <div className="flex flex-col gap-2 max-h-[680px] overflow-y-auto pr-1">
        {questions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-muted-foreground">
            Belum ada soal pada kuis ini.
          </div>
        ) : (
          questions.map((q, idx) => {
            const isSelected = q.id === selectedId
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => onSelect(q.id)}
                className={cn(
                  'flex items-start gap-3 rounded-md border p-3 text-left transition-all',
                  isSelected
                    ? 'border-amber-500 bg-amber-50/30 ring-1 ring-amber-500/30 shadow-2xs'
                    : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/50',
                )}
              >
                {/* Number Badge */}
                <span
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-all',
                    isSelected
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700',
                  )}
                >
                  {idx + 1}
                </span>

                {/* Question Info */}
                <div className="min-w-0 flex-1 space-y-1">
                  <p
                    className={cn(
                      'text-md font-medium line-clamp-2 leading-snug',
                      isSelected ? 'text-amber-950' : 'text-slate-800',
                    )}
                  >
                    {q.question_text}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <span>{q.options?.length ?? 0} opsi</span>
                  </div>
                </div>
              </button>
            )
          })
        )}

        {hasNextPage && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchNextPage?.()}
            disabled={isFetchingNextPage}
            className="mt-2 text-xs text-muted-foreground hover:text-slate-900"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                Memuat lebih banyak...
              </>
            ) : (
              'Muat soal berikutnya'
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
