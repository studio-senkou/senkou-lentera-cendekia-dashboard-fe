import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from '@tanstack/react-router'
import { ChevronLeft, Edit2, Plus } from 'lucide-react'
import { useRef } from 'react'

import { CreateQuestionSheet } from './create-question-sheet'
import { QuizQuestionCard } from './quiz-question-card'
import { QuizSummaryHeader } from './quiz-summary-header'

import type { QuizFormRef } from '@/features/quizzes/widgets/quiz.form'
import { Button } from '@/shared/ui/button'
import { FormSheet } from '@/shared/ui/form-sheet'
import { QuizAttemptsTable } from '@/features/quizzes/widgets/quiz-attempts.table'
import { QuizForm } from '@/features/quizzes/widgets/quiz.form'
import { getQuizAttempts, getQuizById } from '@/entities/quizzes'

export function QuizDetailPage() {
  const navigate = useNavigate()
  const params = useParams({ from: '/_authenticatedLayout/quizzes/$quizId' })
  const quizId = Number(params.quizId)

  const { data: quizDetail, isLoading: loadingQuiz } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => getQuizById(quizId),
    enabled: Number.isFinite(quizId),
  })

  const { data: attempts, isLoading: loadingAttempts } = useQuery({
    queryKey: ['quiz', quizId, 'attempts'],
    queryFn: () => getQuizAttempts(quizId),
    enabled: Number.isFinite(quizId),
  })

  const editQuizRef = useRef<QuizFormRef>(null)

  const handleEditQuizSubmit = async () => {
    if (!editQuizRef.current) {
      throw new Error('Form ref is not available')
    }

    await editQuizRef.current.submit()
  }

  const quiz = quizDetail?.quiz
  const sortedQuestions = [...(quizDetail?.questions ?? [])].sort(
    (left, right) => left.order_number - right.order_number,
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
    <div className="flex flex-col gap-6 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Button
            variant="outline"
            className="p-4 rounded-xl mb-5"
            onClick={() => navigate({ to: '/quizzes' })}
          >
            <ChevronLeft />
            Kembali ke daftar
          </Button>
          <h1 className="text-2xl font-semibold">Detail Kuis</h1>
          <p className="text-sm text-muted-foreground">
            Kelola metadata kuis, soal, pilihan jawaban, dan attempt user.
          </p>
        </div>
      </div>

      <QuizSummaryHeader
        quiz={quiz}
        questionCount={sortedQuestions.length}
        attemptCount={attempts?.length ?? 0}
        isLoading={loadingQuiz}
        editAction={
          quiz ? (
            <FormSheet
              trigger={
                <Button
                  className="w-full justify-center rounded-full p-6"
                  variant={'outline'}
                >
                  <Edit2 className="h-4 w-4" />
                  Edit Kuis
                </Button>
              }
              title="Edit Kuis"
              description="Perbarui metadata kuis sebelum dipublikasikan kembali."
              onSubmitForm={handleEditQuizSubmit}
            >
              <QuizForm ref={editQuizRef} quiz={quiz} />
            </FormSheet>
          ) : (
            <Button
              className="w-full justify-center rounded-full p-6"
              disabled
              variant={'outline'}
            >
              <Edit2 className="h-4 w-4" />
              Edit Kuis
            </Button>
          )
        }
        createAction={
          quiz ? (
            <CreateQuestionSheet quizId={quiz.id} />
          ) : (
            <Button className="w-full justify-center rounded-full p-6" disabled>
              <Plus className="h-4 w-4" />
              Tambah Soal
            </Button>
          )
        }
      />

      <section className="space-y-3 mt-4 bg-background">
        <div className="flex items-center justify-between gap-4">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Daftar Soal</h2>
            <p className="text-sm text-muted-foreground">
              Tambahkan soal terlebih dahulu, lalu isi pilihan jawaban untuk
              setiap soal.
            </p>
          </div>
        </div>

        {loadingQuiz ? (
          <div className="space-y-3">
            <div className="h-24 animate-pulse rounded bg-muted" />
            <div className="h-24 animate-pulse rounded bg-muted" />
          </div>
        ) : sortedQuestions.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            Belum ada soal pada kuis ini.
          </div>
        ) : (
          <div className="space-y-6">
            {sortedQuestions.map((question) => (
              <QuizQuestionCard
                key={question.id}
                quizId={quizId}
                question={question}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3 bg-background mt-4">
        <div>
          <h2 className="text-lg font-semibold">Riwayat Attempt</h2>
          <p className="text-sm text-muted-foreground">
            Daftar attempt semua user, termasuk yang sudah di-reset.
          </p>
        </div>

        <QuizAttemptsTable
          quizId={quizId}
          attempts={attempts ?? []}
          isLoading={loadingAttempts}
        />
      </section>
    </div>
  )
}
