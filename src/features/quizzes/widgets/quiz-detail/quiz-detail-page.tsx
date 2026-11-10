import { useState, useRef, useEffect } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from '@tanstack/react-router'
import {
  BookOpen,
  ChevronLeft,
  Clock3,
  FileSpreadsheet,
  Layers,
  Loader2,
  Plus,
  Save,
  Settings as SettingsIcon,
  Users,
} from 'lucide-react'

import { CreateQuestionSheet } from './create-question-sheet'
import { ImportQuestionsDialog } from './import-questions-dialog'
import { QuizOutlineSidebar } from './quiz-outline-sidebar'
import { QuizQuestionPane } from './quiz-question-pane'

import type { QuizFormRef } from '@/features/quizzes/widgets/quiz.form'
import { Button } from '@/shared/ui/button'
import { QuizAttemptsTable } from '@/features/quizzes/widgets/quiz-attempts.table'
import { QuizForm } from '@/features/quizzes/widgets/quiz.form'
import { useServerTable } from '@/shared/hooks/use-server-table'
import { cn } from '@/shared/lib/utils'
import {
  getQuizAttempts,
  getQuizById,
  getQuizQuestions,
} from '@/entities/quizzes'

const QUESTION_PAGE_SIZE = 30

type ActiveTab = 'questions' | 'settings' | 'results'

export function QuizDetailPage() {
  const navigate = useNavigate()
  const params = useParams({ from: '/_authenticatedLayout/quizzes/$quizId' })
  const quizId = Number(params.quizId)
  const [activeTab, setActiveTab] = useState<ActiveTab>('questions')
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(
    null,
  )
  const [isSavingSettings, setIsSavingSettings] = useState(false)

  const {
    pagination,
    params: attemptParams,
    search,
    searchInput,
    setSearchInput,
    setPage,
    setPageSize,
  } = useServerTable()

  const { data: quizDetail } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => getQuizById(quizId),
    enabled: Number.isFinite(quizId),
  })

  const {
    data: questionsData,
    isLoading: loadingQuestions,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['quiz', quizId, 'questions'],
    queryFn: ({ pageParam }) =>
      getQuizQuestions(quizId, {
        limit: QUESTION_PAGE_SIZE,
        cursor: pageParam,
      }),
    initialPageParam: null as number | null,
    getNextPageParam: (lastPage) =>
      lastPage.meta?.has_more ? lastPage.meta.next_cursor : null,
    enabled: Number.isFinite(quizId),
  })

  const { data: attemptsData, isLoading: loadingAttempts } = useQuery({
    queryKey: [
      'quiz',
      quizId,
      'attempts',
      pagination.currentPage,
      pagination.pageSize,
      search,
    ],
    queryFn: () => getQuizAttempts(quizId, attemptParams),
    enabled: Number.isFinite(quizId),
  })

  const editQuizRef = useRef<QuizFormRef>(null)

  const handleSaveSettings = async () => {
    if (!editQuizRef.current) return
    setIsSavingSettings(true)
    try {
      await editQuizRef.current.submit()
    } finally {
      setIsSavingSettings(false)
    }
  }

  const quiz = quizDetail?.quiz
  const questions = questionsData?.pages.flatMap((page) => page.questions) ?? []
  const sortedQuestions = [...questions].sort(
    (a, b) => a.order_number - b.order_number,
  )
  const questionsTotal =
    questionsData?.pages[0]?.meta?.total ?? sortedQuestions.length
  const attempts = attemptsData?.attempts ?? []
  const attemptsTotal = attemptsData?.meta?.total ?? attempts.length

  // Auto-select first question if none selected or if selected was deleted
  useEffect(() => {
    if (sortedQuestions.length > 0) {
      if (
        selectedQuestionId === null ||
        !sortedQuestions.some((q) => q.id === selectedQuestionId)
      ) {
        setSelectedQuestionId(sortedQuestions[0].id)
      }
    } else {
      setSelectedQuestionId(null)
    }
  }, [sortedQuestions, selectedQuestionId])

  const selectedQuestion = sortedQuestions.find(
    (q) => q.id === selectedQuestionId,
  )
  const selectedIndex = sortedQuestions.findIndex(
    (q) => q.id === selectedQuestionId,
  )

  if (!Number.isFinite(quizId)) {
    return (
      <div className="p-4">
        <div className="rounded-lg border p-4 text-sm text-muted-foreground">
          Quiz tidak ditemukan.
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top Bar / Breadcrumb / Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => navigate({ to: '/quizzes' })}
            className="flex items-center gap-1 border border-neutral-200 px-4 py-2 rounded-full hover:text-slate-900 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4" />
            <span>Daftar Kuis</span>
          </button>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-medium tracking-tight text-slate-900">
              Quiz: {quiz?.title ?? '...'}
            </h1>
            {quiz && (
              <span
                className={cn(
                  'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                  quiz.is_active
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-600',
                )}
              >
                {quiz.is_active ? 'Published' : 'Draft'}
              </span>
            )}
          </div>

          {quiz && (
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1 bg-neutral-100 rounded-full px-3 py-2">
              <span className="flex items-center gap-1 font-medium text-slate-600">
                <div className="bg-amber-100 p-1 rounded-full">
                  <Layers className="h-3.5 w-3.5 text-amber-500" />
                </div>
                <span>{questionsTotal} Pertanyaan</span>
              </span>
              <span className="flex items-center gap-1 font-medium text-slate-600">
                <div className="bg-emerald-100 p-1 rounded-full">
                  <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <span>Passing Score: {quiz.passing_score}</span>
              </span>
              <span className="flex items-center gap-1 font-medium text-slate-600">
                <div className="bg-blue-100 p-1 rounded-full">
                  <Clock3 className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <span>
                  {quiz.time_limit_minutes
                    ? `${quiz.time_limit_minutes} menit`
                    : 'Tanpa batas waktu'}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Global Action buttons */}
        <div className="flex items-center gap-2">
          {activeTab === 'settings' ? (
            <Button
              onClick={handleSaveSettings}
              disabled={isSavingSettings}
              className="gap-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold px-5"
            >
              {isSavingSettings ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Simpan Perubahan
            </Button>
          ) : (
            <>
              <ImportQuestionsDialog
                quizId={quizId}
                trigger={
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 rounded-xl border-emerald-600/30 text-emerald-700 hover:bg-emerald-50 text-xs font-semibold"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                    Import XLSX
                  </Button>
                }
              />
              <CreateQuestionSheet
                quizId={quizId}
                trigger={
                  <Button
                    size="sm"
                    className="gap-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Soal Baru
                  </Button>
                }
              />
            </>
          )}
        </div>
      </div>

      {/* Tabs Navigation (Coursewell UI Style) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('questions')}
          className={cn(
            'inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all',
            activeTab === 'questions'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
          )}
        >
          <span>Questions</span>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-bold',
              activeTab === 'questions'
                ? 'bg-white/20 text-white'
                : 'bg-slate-200 text-slate-700',
            )}
          >
            {questionsTotal}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={cn(
            'inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all',
            activeTab === 'settings'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
          )}
        >
          <SettingsIcon className="h-3.5 w-3.5" />
          <span>Settings</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('results')}
          className={cn(
            'inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all',
            activeTab === 'results'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
          )}
        >
          <Users className="h-3.5 w-3.5" />
          <span>Results</span>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-bold',
              activeTab === 'results'
                ? 'bg-white/20 text-white'
                : 'bg-slate-200 text-slate-700',
            )}
          >
            {attemptsTotal}
          </span>
        </button>
      </div>

      {/* Tab 1: Questions (Coursewell 2-Column Quiz Builder) */}
      {activeTab === 'questions' && (
        <div>
          {loadingQuestions ? (
            <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
              <div className="h-96 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-96 animate-pulse rounded-2xl bg-slate-100" />
            </div>
          ) : sortedQuestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600 mb-4">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Belum ada soal pada kuis ini
              </h3>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                Mulai bangun kuis dengan menambahkan pertanyaan manual atau
                import sekaligus menggunakan file Excel.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <CreateQuestionSheet quizId={quizId} />
                <ImportQuestionsDialog quizId={quizId} />
              </div>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[320px_1fr] items-start">
              {/* Left Column: Outline Sidebar */}
              <QuizOutlineSidebar
                questions={sortedQuestions}
                selectedId={selectedQuestionId}
                onSelect={(id) => setSelectedQuestionId(id)}
                totalQuestions={questionsTotal}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                fetchNextPage={fetchNextPage}
              />

              {/* Right Column: Active Question Detail & Editor */}
              {selectedQuestion ? (
                <QuizQuestionPane
                  key={selectedQuestion.id}
                  quizId={quizId}
                  question={selectedQuestion}
                  questionIndex={selectedIndex >= 0 ? selectedIndex : 0}
                  totalQuestions={sortedQuestions.length}
                  onDeleted={() => {
                    const remaining = sortedQuestions.filter(
                      (q) => q.id !== selectedQuestion.id,
                    )
                    setSelectedQuestionId(remaining[0]?.id ?? null)
                  }}
                />
              ) : (
                <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-muted-foreground">
                  Pilih salah satu soal pada outline untuk melihat detail.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Settings (Dedicated Quiz Metadata Form) */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Pengaturan Metadata Kuis
            </h3>
            <p className="text-xs text-muted-foreground">
              Perbarui judul, passing score, batas waktu pengerjaan, dan status
              publikasi kuis.
            </p>
          </div>

          {quiz && (
            <div className="pt-2">
              <QuizForm
                ref={editQuizRef}
                quiz={quiz}
                onSuccess={() => {
                  setActiveTab('questions')
                }}
              />

              <div className="mt-8 flex justify-end border-t border-slate-100 pt-4">
                <Button
                  onClick={handleSaveSettings}
                  disabled={isSavingSettings}
                  className="gap-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6"
                >
                  {isSavingSettings ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Simpan Pengaturan
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Results & Attempts Log */}
      {activeTab === 'results' && (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Riwayat Attempt & Hasil Peserta
            </h3>
            <p className="text-xs text-muted-foreground">
              Daftar hasil pengerjaan kuis semua peserta, skor, durasi, dan aksi
              reset attempt.
            </p>
          </div>

          <QuizAttemptsTable
            quizId={quizId}
            attempts={attempts}
            isLoading={loadingAttempts}
            pagination={pagination}
            totalItems={attemptsTotal}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            searchValue={searchInput}
            onSearchChange={setSearchInput}
          />
        </div>
      )}
    </div>
  )
}
