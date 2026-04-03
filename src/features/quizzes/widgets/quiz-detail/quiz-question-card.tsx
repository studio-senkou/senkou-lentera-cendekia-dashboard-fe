import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Edit2, Loader2, Plus, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'

import { QuizQuestionOptionRow } from './quiz-question-option-row'

import type { QuizQuestion } from '@/shared/types/response'
import type { OptionFormRef } from '@/features/quizzes/widgets/option.form'
import type { QuestionFormRef } from '@/features/quizzes/widgets/question.form'
import { deleteQuestion } from '@/entities/quizzes'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/ui/alert-dialog'
import { Button } from '@/shared/ui/button'
import { FormSheet } from '@/shared/ui/form-sheet'
import { OptionForm } from '@/features/quizzes/widgets/option.form'
import { QuestionForm } from '@/features/quizzes/widgets/question.form'

interface QuizQuestionCardProps {
  quizId: number
  question: QuizQuestion
}

export function QuizQuestionCard({ quizId, question }: QuizQuestionCardProps) {
  const queryClient = useQueryClient()
  const [deletingQuestionId, setDeletingQuestionId] = useState<number | null>(
    null,
  )
  const editRef = useRef<QuestionFormRef>(null)
  const optionRef = useRef<OptionFormRef>(null)

  const { mutateAsync: removeQuestion } = useMutation({
    mutationFn: (questionId: number) => deleteQuestion(quizId, questionId),
    onMutate: (questionId: number) => {
      setDeletingQuestionId(questionId)
    },
    onSettled: () => {
      setDeletingQuestionId(null)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['quiz', quizId] })
      await queryClient.invalidateQueries({ queryKey: ['quizzes'] })
    },
  })

  const handleEditSubmit = async () => {
    if (!editRef.current) {
      throw new Error('Form ref is not available')
    }

    await editRef.current.submit()
  }

  const handleOptionSubmit = async () => {
    if (!optionRef.current) {
      throw new Error('Form ref is not available')
    }

    await optionRef.current.submit()
  }

  const sortedOptions = [...question.options].sort(
    (left, right) => left.order_number - right.order_number,
  )

  return (
    <div className="rounded-xl border p-4 bg-background">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-base font-semibold">{question.question_text}</h3>
        </div>

        <div className="flex items-center gap-2">
          <FormSheet
            trigger={
              <Button size="icon" variant="warning">
                <Edit2 className="h-4 w-4" />
              </Button>
            }
            title="Edit Soal"
            description="Perbarui isi soal."
            onSubmitForm={handleEditSubmit}
          >
            <QuestionForm ref={editRef} quizId={quizId} question={question} />
          </FormSheet>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="icon" variant="destructive">
                {deletingQuestionId === question.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus soal ini?</AlertDialogTitle>
                <AlertDialogDescription>
                  Semua pilihan jawaban terkait akan ikut terhapus permanen.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={() => removeQuestion(question.id)}>
                  Lanjutkan
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-medium">Pilihan Jawaban</h4>
            <p className="text-xs text-muted-foreground">
              Pastikan hanya satu pilihan yang ditandai benar.
            </p>
          </div>

          <FormSheet
            trigger={
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4" />
                Tambah Pilihan
              </Button>
            }
            title="Tambah Pilihan Jawaban"
            description="Tambahkan pilihan jawaban ke soal ini."
            onSubmitForm={handleOptionSubmit}
          >
            <OptionForm
              ref={optionRef}
              quizId={quizId}
              questionId={question.id}
            />
          </FormSheet>
        </div>

        <div className="space-y-2">
          {sortedOptions.length === 0 ? (
            <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
              Belum ada pilihan jawaban untuk soal ini.
            </div>
          ) : (
            sortedOptions.map((option) => (
              <QuizQuestionOptionRow
                key={option.id}
                quizId={quizId}
                questionId={question.id}
                option={option}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
