import { forwardRef, useImperativeHandle } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import z from 'zod'

import type { QuizQuestion } from '@/shared/types/response'
import { createQuestion, updateQuestion } from '@/entities/quizzes'
import { useAppForm } from '@/shared/hooks/form'
import { cn } from '@/shared/lib/utils'

export interface QuestionFormProps {
  quizId: number
  question?: QuizQuestion | null
  className?: string
  onSuccess?: () => void
}

export interface QuestionFormRef {
  submit: () => Promise<void>
}

const questionSchema = z.object({
  question_text: z.string().min(3, 'Teks pertanyaan minimal 3 karakter'),
})

export const QuestionForm = forwardRef<QuestionFormRef, QuestionFormProps>(
  ({ quizId, question, className, onSuccess }, ref) => {
    const queryClient = useQueryClient()

    const form = useAppForm({
      defaultValues: {
        question_text: question?.question_text ?? '',
      },
      validators: {
        onSubmit: questionSchema,
      },
      onSubmitInvalid: () => {
        throw new Error('Invalid question form submission')
      },
      onSubmit: async ({ value }) => {
        const payload = {
          question_text: value.question_text.trim(),
        }

        if (question) {
          await updateQuestion(quizId, question.id, payload)
        } else {
          await createQuestion(quizId, payload)
        }

        await queryClient.invalidateQueries({ queryKey: ['quiz', quizId] })
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
        id={
          question
            ? `update-question-${question.id}-form`
            : 'create-question-form'
        }
        className={cn('px-4 space-y-4', className)}
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <AppField name="question_text">
          {({ TextArea }) => <TextArea label="Teks Soal" required />}
        </AppField>
      </form>
    )
  },
)

QuestionForm.displayName = 'QuestionForm'
