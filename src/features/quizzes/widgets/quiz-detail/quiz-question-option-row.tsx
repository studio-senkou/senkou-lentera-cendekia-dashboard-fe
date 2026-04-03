import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Edit2, Loader2, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'

import type { QuizOption } from '@/shared/types/response'
import type { OptionFormRef } from '@/features/quizzes/widgets/option.form'
import { deleteQuestionOption } from '@/entities/quizzes'
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
import { cn } from '@/shared/lib/utils'
import { OptionForm } from '@/features/quizzes/widgets/option.form'

interface QuizQuestionOptionRowProps {
  quizId: number
  questionId: number
  option: QuizOption
}

export function QuizQuestionOptionRow({
  quizId,
  questionId,
  option,
}: QuizQuestionOptionRowProps) {
  const queryClient = useQueryClient()
  const [deletingOptionId, setDeletingOptionId] = useState<number | null>(null)
  const editRef = useRef<OptionFormRef>(null)

  const { mutateAsync: removeOption } = useMutation({
    mutationFn: (optionId: number) =>
      deleteQuestionOption(quizId, questionId, optionId),
    onMutate: (optionId: number) => setDeletingOptionId(optionId),
    onSettled: () => setDeletingOptionId(null),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['quiz', quizId] })
      await queryClient.invalidateQueries({ queryKey: ['quizzes'] })
    },
  })

  const handleSubmitForm = async () => {
    if (!editRef.current) {
      throw new Error('Form ref is not available')
    }

    await editRef.current.submit()
  }

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 rounded-md border p-3',
        {
          'border-emerald-200 bg-emerald-50': option.is_correct,
          'bg-neutral-100': !option.is_correct,
        },
      )}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{option.option_text}</span>
          {option.is_correct && (
            <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-medium text-white">
              Jawaban benar
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <FormSheet
          trigger={
            <Button size="icon" variant="outline">
              <Edit2 className="h-4 w-4" />
            </Button>
          }
          title="Edit Pilihan"
          description="Perbarui teks pilihan, urutan, atau status jawaban benar."
          onSubmitForm={handleSubmitForm}
        >
          <OptionForm
            ref={editRef}
            quizId={quizId}
            questionId={questionId}
            option={option}
          />
        </FormSheet>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="icon" variant="destructive">
              {deletingOptionId === option.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus pilihan ini?</AlertDialogTitle>
              <AlertDialogDescription>
                Pilihan jawaban akan dihapus permanen.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={() => removeOption(option.id)}>
                Lanjutkan
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
