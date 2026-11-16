import { forwardRef, useImperativeHandle, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import z from 'zod'

import type { QuizOption } from '@/shared/types/response'
import { createQuestionOption, updateQuestionOption } from '@/entities/quizzes'
import { useAppForm } from '@/shared/hooks/form'
import { cn, getFileUrl } from '@/shared/lib/utils'
import { QuestionImageField } from './question-form/question-image-field'

const MAX_SIZE_BYTES = 2 * 1024 * 1024 // 2 MB

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
  option_text: z.string(),
  is_correct: z.boolean(),
})

export const OptionForm = forwardRef<OptionFormRef, OptionFormProps>(
  ({ quizId, questionId, option, className, onSuccess }, ref) => {
    const queryClient = useQueryClient()
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(
      option?.image_url ? getFileUrl(option.image_url) || null : null,
    )
    const [imageError, setImageError] = useState<string | null>(null)
    const [textError, setTextError] = useState<string | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      if (file.size > MAX_SIZE_BYTES) {
        setImageError('Ukuran gambar maksimal 2 MB')
        e.target.value = ''
        return
      }

      setImageError(null)
      setTextError(null)
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }

    const clearImage = () => {
      setImageFile(null)
      setImagePreview(null)
      setImageError(null)
    }

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
        if (imageError) throw new Error(imageError)

        const optionText = value.option_text.trim()
        if (!optionText && !imagePreview) {
          setTextError('Isi teks pilihan atau unggah gambar')
          throw new Error('Teks pilihan atau gambar wajib diisi')
        }

        setTextError(null)

        const payload = {
          option_text: optionText,
          is_correct: value.is_correct,
          image_url: imageFile ?? undefined,
        }

        if (option) {
          await updateQuestionOption(quizId, questionId, option.id, payload)
        } else {
          await createQuestionOption(quizId, questionId, payload)
        }

        await queryClient.invalidateQueries({ queryKey: ['quiz', quizId] })
        await queryClient.invalidateQueries({
          queryKey: ['quiz', quizId, 'questions'],
        })
        await queryClient.invalidateQueries({ queryKey: ['quizzes'] })
        form.reset()
        clearImage()
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
              required={!imagePreview}
              error={textError ?? undefined}
              onChange={() => setTextError(null)}
              placeholder={
                imagePreview
                  ? 'Teks opsional (gambar sudah diunggah)'
                  : 'Masukkan teks pilihan jawaban'
              }
            />
          )}
        </AppField>

        <QuestionImageField
          imagePreview={imagePreview}
          imageError={imageError}
          onFileChange={handleFileChange}
          onClear={clearImage}
          label="Gambar Pilihan"
          alt="Preview gambar pilihan jawaban"
        />

        <AppField name="is_correct">
          {({ Switch }) => <Switch label="Jawaban benar" />}
        </AppField>
      </form>
    )
  },
)

OptionForm.displayName = 'OptionForm'
