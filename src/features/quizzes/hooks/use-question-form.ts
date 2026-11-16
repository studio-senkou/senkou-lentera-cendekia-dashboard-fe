import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import z from 'zod'

import { createQuestion, updateQuestion } from '@/entities/quizzes'
import { useAppForm } from '@/shared/hooks/form'
import { getFileUrl } from '@/shared/lib/utils'
import type { QuestionFormOptions } from '../types'
import {
  type DraftOption,
  type QuestionType,
  type QuestionTypeValue,
  inferQuestionType,
} from '../types'
import {
  buildChoiceAnswers,
  buildTextAnswers,
  createDraftOption,
  normalizeOptions,
  removeOptionAt,
  toggleOptionCorrect,
} from '../utils/question-payload'

export const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024 // 2 MB

const questionSchema = z.object({
  question_text: z.string().min(3, 'Teks pertanyaan minimal 3 karakter'),
  discrimination: z.string(),
  difficulty: z.string(),
  calibration_version: z.string(),
})

function createInitialOptions(): Array<DraftOption> {
  return [
    { id: '1', text: '', is_correct: true },
    { id: '2', text: '', is_correct: false },
    { id: '3', text: '', is_correct: false },
    { id: '4', text: '', is_correct: false },
  ]
}

function revokePreview(url: string | null | undefined) {
  if (url?.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}

export function useQuestionForm({
  quizId,
  question,
  onSuccess,
}: QuestionFormOptions) {
  const queryClient = useQueryClient()

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(() =>
    question?.image_url ? getFileUrl(question.image_url) || null : null,
  )
  const [imageError, setImageError] = useState<string | null>(null)

  const [options, setOptions] =
    useState<Array<DraftOption>>(createInitialOptions)
  const [textAnswers, setTextAnswers] = useState<Array<string>>([''])
  const [optionsError, setOptionsError] = useState<string | null>(null)
  const [questionType, setQuestionType] = useState<QuestionTypeValue>(() =>
    question ? inferQuestionType(question.options) : '',
  )
  const [questionTypeError, setQuestionTypeError] = useState<string | null>(
    null,
  )

  const clearImage = () => {
    revokePreview(imagePreview)
    setImageFile(null)
    setImagePreview(null)
    setImageError(null)
  }

  const resetDraft = () => {
    clearImage()
    options.forEach((option) => revokePreview(option.imagePreview))
    setOptions(createInitialOptions())
    setTextAnswers([''])
    setOptionsError(null)
    setQuestionType(question ? inferQuestionType(question.options) : '')
    setQuestionTypeError(null)
  }

  const handleTypeChange = (type: QuestionType) => {
    setQuestionType(type)
    setQuestionTypeError(null)
    setOptionsError(null)
    setOptions((previous) => normalizeOptions(previous, type))
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setImageError('Ukuran gambar maksimal 2 MB')
      event.target.value = ''
      return
    }

    revokePreview(imagePreview)
    setImageError(null)
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleAddOption = () => {
    setOptions((previous) => [
      ...previous,
      createDraftOption(String(Date.now())),
    ])
    setOptionsError(null)
  }

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) {
      setOptionsError('Minimal harus ada 2 pilihan jawaban')
      return
    }

    setOptions((previous) => removeOptionAt(previous, index))
    setOptionsError(null)
  }

  const handleOptionTextChange = (index: number, text: string) => {
    setOptions((previous) =>
      previous.map((option, optionIndex) =>
        optionIndex === index ? { ...option, text } : option,
      ),
    )
    setOptionsError(null)
  }

  const handleToggleCorrect = (index: number) => {
    if (!questionType) return

    setOptions((previous) => toggleOptionCorrect(previous, questionType, index))
    setOptionsError(null)
  }

  const handleOptionImageChange = (index: number, file: File | null) => {
    if (!file) return

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setOptionsError('Ukuran gambar pilihan maksimal 2 MB')
      return
    }

    setOptions((previous) =>
      previous.map((option, optionIndex) => {
        if (optionIndex !== index) return option

        revokePreview(option.imagePreview)

        return {
          ...option,
          image: file,
          imagePreview: URL.createObjectURL(file),
        }
      }),
    )
    setOptionsError(null)
  }

  const clearOptionImage = (index: number) => {
    setOptions((previous) =>
      previous.map((option, optionIndex) => {
        if (optionIndex !== index) return option

        revokePreview(option.imagePreview)

        return { ...option, image: null, imagePreview: null }
      }),
    )
  }

  const handleAddTextAnswer = () => {
    setTextAnswers((previous) => [...previous, ''])
    setOptionsError(null)
  }

  const handleRemoveTextAnswer = (index: number) => {
    if (textAnswers.length <= 1) {
      setOptionsError('Minimal harus ada 1 kunci jawaban teks')
      return
    }

    setTextAnswers((previous) =>
      previous.filter((_, answerIndex) => answerIndex !== index),
    )
    setOptionsError(null)
  }

  const handleTextAnswerChange = (index: number, value: string) => {
    setTextAnswers((previous) =>
      previous.map((answer, answerIndex) =>
        answerIndex === index ? value : answer,
      ),
    )
    setOptionsError(null)
  }

  const form = useAppForm({
    defaultValues: {
      question_text: question?.question_text ?? '',
      discrimination:
        question?.discrimination !== null &&
        question?.discrimination !== undefined
          ? String(question.discrimination)
          : '1.0',
      difficulty:
        question?.difficulty !== null && question?.difficulty !== undefined
          ? String(question.difficulty)
          : '0.0',
      calibration_version: question?.calibration_version ?? 'v1.0',
    },
    validators: {
      onSubmit: questionSchema,
    },
    onSubmitInvalid: () => {
      throw new Error('Invalid question form submission')
    },
    onSubmit: async ({ value }) => {
      if (!questionType) {
        setQuestionTypeError('Tipe soal wajib dipilih')
        throw new Error('Tipe soal wajib dipilih')
      }

      setQuestionTypeError(null)

      if (imageError) throw new Error(imageError)

      const questionText = value.question_text.trim()
      const imagePayload = imageFile ?? undefined
      const discrimination = value.discrimination
        ? Number(value.discrimination)
        : 1.0
      const difficulty = value.difficulty ? Number(value.difficulty) : 0.0
      const calibration_version = value.calibration_version?.trim() || 'v1.0'
      const calibration_status = 'calibrated' as const

      if (!question) {
        if (questionType === 'open_ended') {
          await createQuestion(quizId, {
            question_text: questionText,
            question_type: questionType,
            image_url: imagePayload,
            discrimination,
            difficulty,
            calibration_status,
            calibration_version,
          })
        } else if (questionType === 'fill_in_the_blank') {
          const result = buildTextAnswers(textAnswers)

          if (!result.ok) {
            setOptionsError(result.message)
            throw new Error(result.message)
          }

          await createQuestion(quizId, {
            question_text: questionText,
            question_type: questionType,
            image_url: imagePayload,
            discrimination,
            difficulty,
            calibration_status,
            calibration_version,
            answers: result.value,
          })
        } else {
          const result = buildChoiceAnswers(questionType, options)

          if (!result.ok) {
            setOptionsError(result.message)
            throw new Error(result.message)
          }

          await createQuestion(quizId, {
            question_text: questionText,
            question_type: questionType,
            image_url: imagePayload,
            discrimination,
            difficulty,
            calibration_status,
            calibration_version,
            answers: result.value.answers,
            answer_images: result.value.answerImages,
          })
        }
      } else {
        await updateQuestion(quizId, question.id, {
          question_text: questionText,
          question_type: questionType,
          image_url: imagePayload,
          discrimination,
          difficulty,
          calibration_status,
          calibration_version,
        })
      }

      await queryClient.invalidateQueries({ queryKey: ['quiz', quizId] })
      await queryClient.invalidateQueries({
        queryKey: ['quiz', quizId, 'questions'],
      })
      await queryClient.invalidateQueries({ queryKey: ['quizzes'] })
      form.reset()
      resetDraft()
      onSuccess?.()
    },
  })

  return {
    form,
    questionType,
    questionTypeError,
    imagePreview,
    imageError,
    options,
    textAnswers,
    optionsError,
    handleTypeChange,
    handleFileChange,
    clearImage,
    handleAddOption,
    handleRemoveOption,
    handleOptionTextChange,
    handleToggleCorrect,
    handleOptionImageChange,
    clearOptionImage,
    handleAddTextAnswer,
    handleRemoveTextAnswer,
    handleTextAnswerChange,
  }
}
