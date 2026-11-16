import type { CreateQuestionAnswer } from '@/entities/quizzes'
import type { ChoiceQuestionType, DraftOption, QuestionType } from '../types'

export type QuestionDraftResult<T> =
  | { ok: true; value: T }
  | { ok: false; message: string }

export interface ChoiceAnswerBundle {
  answers: Array<CreateQuestionAnswer>
  answerImages: Array<File>
}

export function createDraftOption(id: string): DraftOption {
  return { id, text: '', is_correct: false }
}

export function normalizeOptions(
  options: ReadonlyArray<DraftOption>,
  questionType: QuestionType,
): Array<DraftOption> {
  if (questionType === 'multiple_choice') {
    let foundCorrect = false

    return options.map((option) => {
      if (option.is_correct && !foundCorrect) {
        foundCorrect = true
        return option
      }

      return { ...option, is_correct: false }
    })
  }

  if (questionType === 'poll' || questionType === 'open_ended') {
    return options.map((option) => ({ ...option, is_correct: false }))
  }

  return [...options]
}

export function toggleOptionCorrect(
  options: ReadonlyArray<DraftOption>,
  questionType: QuestionType,
  index: number,
): Array<DraftOption> {
  if (questionType === 'multiple_choice') {
    return options.map((option, optionIndex) => ({
      ...option,
      is_correct: optionIndex === index,
    }))
  }

  return options.map((option, optionIndex) =>
    optionIndex === index
      ? { ...option, is_correct: !option.is_correct }
      : option,
  )
}

export function removeOptionAt(
  options: ReadonlyArray<DraftOption>,
  index: number,
): Array<DraftOption> {
  const next = options.filter((_, optionIndex) => optionIndex !== index)

  if (options[index]?.is_correct && next.length > 0) {
    next[0] = { ...next[0], is_correct: true }
  }

  return next
}

export function buildTextAnswers(
  textAnswers: ReadonlyArray<string>,
): QuestionDraftResult<Array<CreateQuestionAnswer>> {
  const answers = textAnswers
    .map((answer) => answer.trim())
    .filter((answer) => answer.length > 0)
    .map((option_text) => ({ option_text, is_correct: true }))

  if (answers.length === 0) {
    return { ok: false, message: 'Isi minimal 1 kunci jawaban teks' }
  }

  return { ok: true, value: answers }
}

export function buildChoiceAnswers(
  questionType: ChoiceQuestionType,
  options: ReadonlyArray<DraftOption>,
): QuestionDraftResult<ChoiceAnswerBundle> {
  const filledOptions = options.filter(
    (option) =>
      option.text.trim().length > 0 ||
      Boolean(option.image || option.imagePreview),
  )

  if (filledOptions.length < 2) {
    return {
      ok: false,
      message: 'Isi minimal 2 pilihan jawaban (teks atau gambar)',
    }
  }

  if (questionType === 'multiple_choice') {
    const correctCount = filledOptions.filter(
      (option) => option.is_correct,
    ).length

    if (correctCount !== 1) {
      return {
        ok: false,
        message: 'Pilih tepat satu jawaban benar (Radio)',
      }
    }
  }

  if (
    questionType === 'checkbox' &&
    !filledOptions.some((option) => option.is_correct)
  ) {
    return {
      ok: false,
      message: 'Pilih minimal satu jawaban benar (Checkbox)',
    }
  }

  const answerImages: Array<File> = []
  const answers = filledOptions.map<CreateQuestionAnswer>((option) => {
    const answer: CreateQuestionAnswer = {
      option_text: option.text.trim(),
      is_correct: questionType === 'poll' ? false : option.is_correct,
    }

    if (option.image) {
      answer.image_index = answerImages.length
      answerImages.push(option.image)
    }

    return answer
  })

  return { ok: true, value: { answers, answerImages } }
}
