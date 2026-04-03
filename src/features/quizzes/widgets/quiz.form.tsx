import { forwardRef, useImperativeHandle } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import z from 'zod'

import type { Quiz } from '@/shared/types/response'
import { createQuiz, updateQuiz } from '@/entities/quizzes'
import { useAppForm } from '@/shared/hooks/form'
import { cn } from '@/shared/lib/utils'

export interface QuizFormProps {
  quiz?: Quiz | null
  className?: string
  onSuccess?: () => void
}

export interface QuizFormRef {
  submit: () => Promise<void>
}

const quizSchema = z.object({
  title: z.string().min(3, 'Judul kuis minimal 3 karakter'),
  description: z
    .string()
    .refine((value) => value.trim() === '' || value.trim().length >= 3, {
      message: 'Deskripsi kuis minimal 3 karakter jika diisi',
    }),
  passing_score: z.string().refine(
    (value) => {
      if (value.trim() === '') return false
      const parsed = Number(value)
      return Number.isInteger(parsed) && parsed >= 0 && parsed <= 100
    },
    { message: 'Passing score harus berupa angka 0 sampai 100' },
  ),
  time_limit_minutes: z.string().refine(
    (value) => {
      if (value.trim() === '') return true
      const parsed = Number(value)
      return Number.isInteger(parsed) && parsed >= 1
    },
    { message: 'Batas waktu harus berupa angka minimal 1 menit' },
  ),
  is_active: z.boolean(),
})

export const QuizForm = forwardRef<QuizFormRef, QuizFormProps>(
  ({ quiz, className, onSuccess }, ref) => {
    const queryClient = useQueryClient()

    const form = useAppForm({
      defaultValues: {
        title: quiz?.title ?? '',
        description: quiz?.description ?? '',
        passing_score: quiz?.passing_score.toString() ?? '70',
        time_limit_minutes: quiz?.time_limit_minutes?.toString() ?? '',
        is_active: quiz?.is_active ?? false,
      },
      validators: {
        onSubmit: quizSchema,
      },
      onSubmitInvalid: () => {
        throw new Error('Invalid quiz form submission')
      },
      onSubmit: async ({ value }) => {
        const payload = {
          title: value.title.trim(),
          description:
            value.description.trim() === '' ? null : value.description.trim(),
          passing_score: Number(value.passing_score),
          time_limit_minutes:
            value.time_limit_minutes.trim() === ''
              ? null
              : Number(value.time_limit_minutes),
          is_active: value.is_active,
        }

        if (quiz) {
          await updateQuiz(quiz.id, payload)
          await queryClient.invalidateQueries({ queryKey: ['quiz', quiz.id] })
        } else {
          await createQuiz(payload)
        }

        await queryClient.invalidateQueries({ queryKey: ['quizzes'] })
        form.reset()
        onSuccess?.()
      },
    })

    useImperativeHandle(ref, () => ({
      submit: async () => {
        await form.handleSubmit()
      },
    }))

    const { AppField } = form

    return (
      <form
        id={quiz ? `update-quiz-${quiz.id}-form` : 'create-quiz-form'}
        className={cn('px-4 space-y-4', className)}
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <AppField name="title">
          {({ TextField }) => (
            <TextField
              type="text"
              label="Judul Kuis"
              required
              name="title"
              placeholder="Masukkan judul kuis"
            />
          )}
        </AppField>

        <AppField name="description">
          {({ TextArea }) => <TextArea label="Deskripsi" />}
        </AppField>

        <div className="grid gap-4 md:grid-cols-2">
          <AppField name="passing_score">
            {({ TextField }) => (
              <TextField
                type="number"
                label="Passing Score"
                required
                name="passing_score"
                placeholder="0 - 100"
              />
            )}
          </AppField>

          <AppField name="time_limit_minutes">
            {({ TextField }) => (
              <TextField
                type="number"
                label="Batas Waktu (Menit)"
                name="time_limit_minutes"
                placeholder="Kosongkan jika tanpa batas"
              />
            )}
          </AppField>
        </div>

        <AppField name="is_active">
          {({ Switch }) => <Switch label="Aktifkan kuis" />}
        </AppField>
      </form>
    )
  },
)

QuizForm.displayName = 'QuizForm'
