import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Check, ImagePlus, Plus, Trash2, X } from 'lucide-react'
import z from 'zod'

import type { QuizQuestion } from '@/shared/types/response'
import { createQuestion, updateQuestion } from '@/entities/quizzes'
import { useAppForm } from '@/shared/hooks/form'
import { cn, getFileUrl } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'

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

interface DraftOption {
  id: string
  text: string
  is_correct: boolean
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']

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

    // Option state for creation mode (Coursewell inspired)
    const [options, setOptions] = useState<DraftOption[]>([
      { id: '1', text: '', is_correct: true },
      { id: '2', text: '', is_correct: false },
      { id: '3', text: '', is_correct: false },
      { id: '4', text: '', is_correct: false },
    ])
    const [optionsError, setOptionsError] = useState<string | null>(null)

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

    const handleAddOption = () => {
      setOptions((prev) => [
        ...prev,
        { id: String(Date.now()), text: '', is_correct: false },
      ])
      setOptionsError(null)
    }

    const handleRemoveOption = (index: number) => {
      if (options.length <= 2) {
        setOptionsError('Minimal harus ada 2 pilihan jawaban')
        return
      }
      setOptions((prev) => {
        const next = prev.filter((_, i) => i !== index)
        // If removed option was the correct one, make the first one correct
        if (prev[index].is_correct && next.length > 0) {
          next[0].is_correct = true
        }
        return next
      })
      setOptionsError(null)
    }

    const handleOptionTextChange = (index: number, text: string) => {
      setOptions((prev) =>
        prev.map((opt, i) => (i === index ? { ...opt, text } : opt)),
      )
      setOptionsError(null)
    }

    const handleSetCorrect = (index: number) => {
      setOptions((prev) =>
        prev.map((opt, i) => ({ ...opt, is_correct: i === index })),
      )
      setOptionsError(null)
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

        // Validate options when creating new question
        if (!question) {
          const filledOptions = options.filter((o) => o.text.trim().length > 0)
          if (filledOptions.length < 2) {
            setOptionsError('Isi minimal 2 pilihan jawaban')
            throw new Error('Minimal 2 pilihan jawaban harus diisi')
          }
          const hasCorrect = filledOptions.some((o) => o.is_correct)
          if (!hasCorrect) {
            setOptionsError('Pilih salah satu jawaban yang benar')
            throw new Error('Pilih salah satu jawaban yang benar')
          }

          const answersPayload = filledOptions.map((o) => ({
            option_text: o.text.trim(),
            is_correct: o.is_correct,
          }))

          await createQuestion(quizId, {
            question_text: value.question_text.trim(),
            image_url: imageFile ?? undefined,
            answers: answersPayload,
          })
        } else {
          await updateQuestion(quizId, question.id, {
            question_text: value.question_text.trim(),
            image_url: imageFile ?? undefined,
          })
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
        id={
          question
            ? `update-question-${question.id}-form`
            : 'create-question-form'
        }
        className={cn('px-4 space-y-6', className)}
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <AppField name="question_text">
          {({ TextArea }) => (
            <TextArea
              label="Teks Pertanyaan"
              rows={3}
              required
            />
          )}
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
            <div className="relative w-full overflow-hidden rounded-xl border border-border">
              <img
                src={imagePreview}
                alt="Preview gambar soal"
                className="h-44 w-full object-contain bg-slate-50"
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
              className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-slate-50 py-6 text-sm text-muted-foreground hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <ImagePlus className="h-6 w-6 opacity-40" />
              <span>Klik untuk mengunggah gambar pendukung</span>
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

        {/* Coursewell LMS style Options Builder - Shown for new questions */}
        {!question && (
          <div className="space-y-4 rounded-xl border border-border bg-slate-50/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-900">
                  Pilihan Jawaban (Multiple Choice)
                </h4>
                <p className="text-xs text-muted-foreground">
                  Pilih salah satu huruf sebagai kunci jawaban yang benar.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddOption}
                className="h-8 gap-1 rounded-lg text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                Tambah Pilihan
              </Button>
            </div>

            {/* Quick True Answer (Kunci Jawaban) Character Selector */}
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200/80 bg-white p-3">
              <span className="text-xs font-bold text-slate-700 mr-1">
                Kunci Jawaban Benar:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {options.map((opt, idx) => {
                  const letter = OPTION_LETTERS[idx] || String(idx + 1)
                  const isSelected = opt.is_correct
                  return (
                    <button
                      key={`quick-key-${opt.id}`}
                      type="button"
                      onClick={() => handleSetCorrect(idx)}
                      className={cn(
                        'flex h-7 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-bold transition-all cursor-pointer',
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-600/30'
                          : 'border border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-800',
                      )}
                    >
                      {letter} {isSelected && '✓'}
                    </button>
                  )
                })}
              </div>
            </div>

            {optionsError && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                {optionsError}
              </div>
            )}

            <div className="space-y-2.5">
              {options.map((opt, idx) => {
                const letter = OPTION_LETTERS[idx] || String(idx + 1)
                return (
                  <div
                    key={opt.id}
                    className={cn(
                      'flex items-center gap-2.5 rounded-xl border p-2.5 transition-all',
                      opt.is_correct
                        ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500/30'
                        : 'border-slate-200 bg-white hover:border-slate-300',
                    )}
                  >
                    {/* Select Correct Answer Button / Radio */}
                    <button
                      type="button"
                      onClick={() => handleSetCorrect(idx)}
                      title={`Tandai pilihan ${letter} sebagai jawaban benar`}
                      className={cn(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all cursor-pointer',
                        opt.is_correct
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'border border-slate-300 bg-slate-50 text-slate-600 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700',
                      )}
                    >
                      {opt.is_correct ? (
                        <Check className="h-4 w-4 stroke-[3]" />
                      ) : (
                        letter
                      )}
                    </button>

                    {/* Option Text Input */}
                    <Input
                      placeholder={`Pilihan ${letter}...`}
                      value={opt.text}
                      onChange={(e) =>
                        handleOptionTextChange(idx, e.target.value)
                      }
                      className="h-9 border-none bg-transparent shadow-none focus-visible:ring-0 text-sm font-medium"
                    />

                    {/* Correct badge tag or set correct action */}
                    {opt.is_correct ? (
                      <span className="shrink-0 inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                        <Check className="h-3 w-3 stroke-[3]" />
                        Benar ({letter})
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetCorrect(idx)}
                        className="hidden sm:inline-flex shrink-0 text-xs text-muted-foreground hover:text-emerald-700 hover:underline px-1 cursor-pointer font-medium"
                      >
                        Pilih {letter}
                      </button>
                    )}

                    {/* Delete Option */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveOption(idx)}
                      disabled={options.length <= 2}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </form>
    )
  },
)

QuestionForm.displayName = 'QuestionForm'
