import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Check,
  Edit2,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react'
import { useRef, useState } from 'react'

import type { QuizQuestion } from '@/shared/types/response'
import type { OptionFormRef } from '@/features/quizzes/widgets/option.form'
import type { QuestionFormRef } from '@/features/quizzes/widgets/question.form'
import { deleteQuestion, deleteQuestionOption } from '@/entities/quizzes'
import { cn, getFileUrl } from '@/shared/lib/utils'
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

interface QuizQuestionPaneProps {
  quizId: number
  question: QuizQuestion
  questionIndex: number
  totalQuestions: number
  onDeleted?: () => void
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']

export function QuizQuestionPane({
  quizId,
  question,
  questionIndex,
  totalQuestions,
  onDeleted,
}: QuizQuestionPaneProps) {
  const queryClient = useQueryClient()
  const [isDeletingQuestion, setIsDeletingQuestion] = useState(false)
  const [deletingOptionId, setDeletingOptionId] = useState<number | null>(null)

  const editRef = useRef<QuestionFormRef>(null)
  const optionRef = useRef<OptionFormRef>(null)

  const { mutateAsync: removeQuestion } = useMutation({
    mutationFn: (questionId: number) => deleteQuestion(quizId, questionId),
    onMutate: () => setIsDeletingQuestion(true),
    onSettled: () => setIsDeletingQuestion(false),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['quiz', quizId] })
      await queryClient.invalidateQueries({
        queryKey: ['quiz', quizId, 'questions'],
      })
      await queryClient.invalidateQueries({ queryKey: ['quizzes'] })
      onDeleted?.()
    },
  })

  const { mutateAsync: removeOption } = useMutation({
    mutationFn: (optionId: number) =>
      deleteQuestionOption(quizId, question.id, optionId),
    onMutate: (optionId) => setDeletingOptionId(optionId),
    onSettled: () => setDeletingOptionId(null),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['quiz', quizId] })
      await queryClient.invalidateQueries({
        queryKey: ['quiz', quizId, 'questions'],
      })
      await queryClient.invalidateQueries({ queryKey: ['quizzes'] })
    },
  })

  const handleEditSubmit = async () => {
    if (!editRef.current) throw new Error('Form ref is not available')
    await editRef.current.submit()
  }

  const handleOptionSubmit = async () => {
    if (!optionRef.current) throw new Error('Form ref is not available')
    await optionRef.current.submit()
  }

  const sortedOptions = [...question.options].sort(
    (a, b) => a.order_number - b.order_number,
  )

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
      {/* Top Header: Question X of Y */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <span className="text-md font-medium tracking-wider">
            Soal {questionIndex + 1} dari {totalQuestions}
          </span>
          <p className="text-sm text-muted-foreground mt-0.5">
            {sortedOptions.length} pilihan jawaban
          </p>
        </div>

        <div className="flex items-center gap-2">
          <FormSheet
            trigger={
              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                <Edit2 className="h-3.5 w-3.5" />
                Edit Soal
              </Button>
            }
            title="Edit Pertanyaan"
            description="Perbarui teks pertanyaan atau gambar pendukung."
            onSubmitForm={handleEditSubmit}
          >
            <QuestionForm ref={editRef} quizId={quizId} question={question} />
          </FormSheet>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="destructive"
                className="gap-1.5 text-xs"
              >
                {isDeletingQuestion ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                Hapus
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus soal ini?</AlertDialogTitle>
                <AlertDialogDescription>
                  Semua pilihan jawaban terkait akan ikut terhapus secara
                  permanen.
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

      {/* Question Prompt Area */}
      <div className="mt-5 space-y-4">
        <div>
          <label className="text-md font-medium tracking-wider text-neutral-400">
            Teks Pertanyaan
          </label>
          <div className="mt-1.5 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <p className="text-base font-medium leading-relaxed">
              {question.question_text}
            </p>
          </div>
        </div>

        {/* Media / Image if available */}
        {question.image_url && (
          <div>
            <label className="text-md font-medium tracking-wider text-neutral-400">
              Gambar Pendukung
            </label>
            <div className="mt-1.5 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <img
                src={getFileUrl(question.image_url)}
                alt="Gambar soal"
                className="max-h-64 w-full object-contain p-2"
              />
            </div>
          </div>
        )}
      </div>

      {/* Answer Options Section */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-md font-medium tracking-wider text-neutral-400">
              Pilihan Jawaban (Answer options)
            </h4>
            <p className="text-sm text-muted-foreground">
              Pilihan dengan tanda hijau adalah jawaban yang benar.
            </p>
          </div>

          <FormSheet
            trigger={
              <Button size="sm" variant="outline" className="gap-1 text-xs">
                <Plus className="h-3.5 w-3.5" />
                Tambah Pilihan
              </Button>
            }
            title="Tambah Pilihan Jawaban"
            description="Tambahkan opsi jawaban baru ke soal ini."
            onSubmitForm={handleOptionSubmit}
          >
            <OptionForm
              ref={optionRef}
              quizId={quizId}
              questionId={question.id}
            />
          </FormSheet>
        </div>

        <div className="space-y-2.5">
          {sortedOptions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-muted-foreground">
              Belum ada pilihan jawaban untuk soal ini.
            </div>
          ) : (
            sortedOptions.map((option, idx) => {
              const letter = OPTION_LETTERS[idx] || String(idx + 1)
              return (
                <div
                  key={option.id}
                  className={cn(
                    'flex items-center justify-between gap-3 rounded-xl border p-3.5 transition-all',
                    option.is_correct
                      ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300',
                  )}
                >
                  <div className="flex items-center gap-3">
                    {/* Radio state indicator */}
                    <span
                      className={cn(
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all',
                        option.is_correct
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600',
                      )}
                    >
                      {option.is_correct ? (
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      ) : (
                        letter
                      )}
                    </span>

                    <span
                      className={cn(
                        'text-sm font-medium',
                        option.is_correct
                          ? 'font-semibold text-emerald-950'
                          : 'text-slate-800',
                      )}
                    >
                      {option.option_text}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {option.is_correct && (
                      <span className="inline-flex items-center rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                        Correct
                      </span>
                    )}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={deletingOptionId === option.id}
                          className="h-8 w-8 text-slate-400 hover:text-destructive"
                        >
                          {deletingOptionId === option.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus pilihan ini?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Pilihan jawaban akan dihapus secara permanen.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => removeOption(option.id)}
                          >
                            Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
