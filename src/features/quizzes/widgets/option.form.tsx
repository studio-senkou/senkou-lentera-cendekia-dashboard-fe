import { forwardRef, useImperativeHandle } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import z from 'zod'

import type { QuizOption } from '@/shared/types/response'
import { createQuestionOption, updateQuestionOption } from '@/entities/quizzes'
import { useAppForm } from '@/shared/hooks/form'
import { cn } from '@/shared/lib/utils'

export interface OptionFormProps {
  quizId: number
  questionId: number
  option?: QuizOption | null
  className?: string
  onSuccess?: () => void
}

export interface OptionFormRef {
  submit: () => Promise<void>
}

const optionSchema = z.object({
  option_text: z.string().min(1, 'Teks pilihan jawaban wajib diisi'),
  is_correct: z.boolean(),
})

export const OptionForm = forwardRef<OptionFormRef, OptionFormProps>(
  ({ quizId, questionId, option, className, onSuccess }, ref) => {
    const queryClient = useQueryClient()

    const form = useAppForm({
      defaultValues: {
        option_text: option?.option_text ?? '',
        is_correct: option?.is_correct ?? false,
      },
      validators: {
        onSubmit: optionSchema,
      },
      onSubmitInvalid: () => {
        throw new Error('Invalid option form submission')
      },
      onSubmit: async ({ value }) => {
        const payload = {
          option_text: value.option_text.trim(),
          is_correct: value.is_correct,
        }

        if (option) {
          await updateQuestionOption(quizId, questionId, option.id, payload)
        } else {
          await createQuestionOption(quizId, questionId, payload)
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
        id={option ? `update-option-${option.id}-form` : 'create-option-form'}
        className={cn('px-4 space-y-4', className)}
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <AppField name="option_text">
          {({ TextField }) => (
            <TextField
              type="text"
              label="Teks Pilihan"
              name="option_text"
              required
              placeholder="Masukkan teks pilihan jawaban"
            />
          )}
        </AppField>

        <AppField name="is_correct">
          {({ Switch }) => <Switch label="Jawaban benar" />}
        </AppField>
      </form>
    )
  },
)

OptionForm.displayName = 'OptionForm'
