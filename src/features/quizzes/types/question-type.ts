export type QuestionType =
  | 'multiple_choice'
  | 'checkbox'
  | 'fill_in_the_blank'
  | 'open_ended'
  | 'poll'

export type QuestionTypeValue = QuestionType | ''

export type ChoiceQuestionType = Extract<
  QuestionType,
  'multiple_choice' | 'checkbox' | 'poll'
>

export const CHOICE_QUESTION_TYPES: ReadonlyArray<ChoiceQuestionType> = [
  'multiple_choice',
  'checkbox',
  'poll',
]

export function isChoiceQuestionType(
  type: QuestionTypeValue,
): type is ChoiceQuestionType {
  return CHOICE_QUESTION_TYPES.some((choice) => choice === type)
}

export function inferQuestionType(
  options: ReadonlyArray<{ is_correct: boolean }>,
): QuestionType {
  if (options.length === 0) return 'open_ended'

  const correctCount = options.filter((option) => option.is_correct).length

  if (correctCount > 1) return 'checkbox'
  if (correctCount === 1) return 'multiple_choice'
  return 'poll'
}

export interface DraftOption {
  id: string
  text: string
  is_correct: boolean
  image?: File | null
  imagePreview?: string | null
}

export interface QuestionTypeMeta {
  value: QuestionType
  label: string
  badge: string
  hint: string
}

export const QUESTION_TYPES: Array<QuestionTypeMeta> = [
  {
    value: 'multiple_choice',
    label: 'Pilihan Ganda',
    badge: '1 Jawaban',
    hint: 'Pilih 1 jawaban benar (Radio)',
  },
  {
    value: 'checkbox',
    label: 'Kotak Centang',
    badge: 'Multi-Jawaban',
    hint: '1 atau lebih jawaban benar (Checkbox)',
  },
  {
    value: 'poll',
    label: 'Jajak Pendapat',
    badge: 'Survei',
    hint: 'Survei tanpa benar atau salah',
  },
  {
    value: 'fill_in_the_blank',
    label: 'Isian Singkat',
    badge: 'Teks',
    hint: 'Siswa mengetik jawaban singkat',
  },
  {
    value: 'open_ended',
    label: 'Esai / Terbuka',
    badge: 'Esai',
    hint: 'Jawaban bebas tanpa penilaian otomatis',
  },
]

export const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
