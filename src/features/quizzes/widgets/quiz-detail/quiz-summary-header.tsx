import { BookOpen, CalendarDays, Clock3, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'

import type { Quiz } from '@/shared/types/response'

interface QuizSummaryHeaderProps {
  quiz: Quiz | null | undefined
  questionCount: number
  attemptCount: number
  isLoading: boolean
  editAction: ReactNode
  createAction: ReactNode
}

function formatQuizDate(value: string) {
  return new Date(value).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function QuizSummaryHeader({
  quiz,
  isLoading,
  editAction,
  createAction,
}: QuizSummaryHeaderProps) {
  const activeStatusLabel = quiz?.is_active ? 'Aktif' : 'Draft'
  const activeStatusClass = quiz?.is_active
    ? 'bg-emerald-400/20 text-emerald-50 ring-1 ring-emerald-300/30'
    : 'bg-white/10 text-white ring-1 ring-white/10'

  if (isLoading) {
    return (
      <div className="grid gap-4 xl:grid-cols-[1.6fr_0.9fr]">
        <div className="rounded-3xl border bg-muted/40 p-5 shadow-sm">
          <div className="space-y-4">
            <div className="h-5 w-24 animate-pulse rounded-full bg-muted" />
            <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="h-20 animate-pulse rounded-2xl bg-muted" />
              <div className="h-20 animate-pulse rounded-2xl bg-muted" />
              <div className="h-20 animate-pulse rounded-2xl bg-muted" />
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
          <div className="h-28 animate-pulse rounded-3xl bg-muted" />
          <div className="h-28 animate-pulse rounded-3xl bg-muted" />
          <div className="h-28 animate-pulse rounded-3xl bg-muted" />
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="rounded-3xl border border-dashed bg-background p-5 text-sm text-muted-foreground">
        Ringkasan kuis tidak tersedia.
      </div>
    )
  }

  const timeLimitLabel = quiz.time_limit_minutes
    ? `${quiz.time_limit_minutes} menit`
    : 'Tanpa batas waktu'

  return (
    <>
      <div className="grid gap-4 xl:grid-cols-[1.6fr_0.9fr]">
        <div className="overflow-hidden rounded-3xl border border-emerald-950/10 bg-emerald-600 p-5 text-white">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <div
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${activeStatusClass}`}
              >
                <span className="h-2 w-2 rounded-full bg-current" />
                {activeStatusLabel}
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  {quiz.title}
                </h2>
                <p className="max-w-xl text-sm leading-6 text-white/78 sm:text-base">
                  {quiz.description || 'Tidak ada deskripsi.'}
                </p>
              </div>

              <div className="mt-auto flex flex-wrap gap-2 text-xs text-white/80">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {formatQuizDate(quiz.created_at)}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                  <BookOpen className="h-3.5 w-3.5" />
                  Passing score {quiz.passing_score}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                  <Clock3 className="h-3.5 w-3.5" />
                  {timeLimitLabel}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <div className="rounded-3xl border bg-background p-5">
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                <Sparkles className="h-4 w-4" />
              </span>
              Aksi Cepat
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Kelola metadata kuis atau tambah soal baru dari sini.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {editAction}
              {createAction}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
