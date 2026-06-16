import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ImagePlus, X } from 'lucide-react'
import z from 'zod'

import type { QuizQuestion } from '@/shared/types/response'
import { createQuestion, updateQuestion } from '@/entities/quizzes'
import { useAppForm } from '@/shared/hooks/form'
import { cn, getFileUrl } from '@/shared/lib/utils'

const MAX_SIZE_BYTES = 1 * 1024 * 1024 // 1 MB

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
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(
      question?.image_url ? getFileUrl(question.image_url) || null : null,
    )
    const [imageError, setImageError] = useState<string | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      if (file.size > MAX_SIZE_BYTES) {
        setImageError('Ukuran gambar maksimal 1 MB')
        e.target.value = ''
        return
      }

      setImageError(null)
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }

    const clearImage = () => {
      setImageFile(null)
      setImagePreview(null)
      setImageError(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }

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
        if (imageError) throw new Error(imageError)

        const payload = {
          question_text: value.question_text.trim(),
          image_url: imageFile ?? undefined,
        }

        if (question) {
          await updateQuestion(quizId, question.id, payload)
        } else {
          await createQuestion(quizId, payload)
        }

        await queryClient.invalidateQueries({ queryKey: ['quiz', quizId] })
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
        id={
          question
            ? `update-question-${question.id}-form`
            : 'create-question-form'
        }
        className={cn('px-4 space-y-5', className)}
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <AppField name="question_text">
          {({ TextArea }) => <TextArea label="Teks Soal" required />}
        </AppField>

        {/* Image Upload */}
        <div className="space-y-2">
          <label className="text-sm font-semibold" style={{ color: '#101828' }}>
            Gambar Soal{' '}
            <span className="text-xs font-normal" style={{ color: '#98A2B3' }}>
              (opsional, maks. 1 MB)
            </span>
          </label>

          {imagePreview ? (
            <div className="relative w-full overflow-hidden rounded-lg border border-border">
              <img
                src={imagePreview}
                alt="Preview gambar soal"
                className="h-48 w-full object-contain bg-slate-50"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-slate-50 py-8 text-sm text-muted-foreground hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <ImagePlus className="h-8 w-8 opacity-40" />
              <span>Klik untuk mengunggah gambar</span>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {imageError && (
            <p className="text-xs text-destructive">{imageError}</p>
          )}
        </div>
      </form>
    )
  },
)

QuestionForm.displayName = 'QuestionForm'
