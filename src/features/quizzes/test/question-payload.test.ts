// @vitest-environment node
import { describe, expect, it } from 'vitest'

import {
  buildChoiceAnswers,
  buildTextAnswers,
  normalizeOptions,
  removeOptionAt,
} from '@/features/quizzes/utils/question-payload'
import { inferQuestionType } from '@/features/quizzes/types'
import type { DraftOption } from '@/features/quizzes/types'

function createOptions(
  entries: ReadonlyArray<Partial<DraftOption>>,
): Array<DraftOption> {
  return entries.map((entry, index) => ({
    id: String(index + 1),
    text: `Option ${index + 1}`,
    is_correct: false,
    ...entry,
  }))
}

describe('Question payload', () => {
  describe('Choice answers', () => {
    it('Must build answers with the correct flag when a choice question is valid', () => {
      const options = createOptions([
        { text: 'A', is_correct: true },
        { text: 'B' },
      ])

      const result = buildChoiceAnswers('multiple_choice', options)

      expect(result).toEqual({
        ok: true,
        value: {
          answers: [
            { option_text: 'A', is_correct: true },
            { option_text: 'B', is_correct: false },
          ],
          answerImages: [],
        },
      })
    })

    it('Must reject the answers when fewer than two options are filled', () => {
      const options = createOptions([
        { text: 'A', is_correct: true },
        { text: '   ' },
      ])

      const result = buildChoiceAnswers('multiple_choice', options)

      expect(result).toEqual({
        ok: false,
        message: 'Isi minimal 2 pilihan jawaban (teks atau gambar)',
      })
    })

    it('Must accept an answer when the text is empty but an image is uploaded', () => {
      const image = new File(['image'], 'answer.png', { type: 'image/png' })
      const options = createOptions([
        { text: '', is_correct: true, image },
        { text: 'B' },
      ])

      const result = buildChoiceAnswers('multiple_choice', options)

      expect(result).toEqual({
        ok: true,
        value: {
          answers: [
            { option_text: '', is_correct: true, image_index: 0 },
            { option_text: 'B', is_correct: false },
          ],
          answerImages: [image],
        },
      })
    })

    it('Must reject an option when it has neither text nor an image', () => {
      const options = createOptions([
        { text: '', is_correct: true },
        { text: 'B' },
      ])

      const result = buildChoiceAnswers('multiple_choice', options)

      expect(result).toEqual({
        ok: false,
        message: 'Isi minimal 2 pilihan jawaban (teks atau gambar)',
      })
    })

    it('Must reject the answers when multiple choices are marked correct', () => {
      const options = createOptions([
        { text: 'A', is_correct: true },
        { text: 'B', is_correct: true },
      ])

      const result = buildChoiceAnswers('multiple_choice', options)

      expect(result).toEqual({
        ok: false,
        message: 'Pilih tepat satu jawaban benar (Radio)',
      })
    })

    it('Must reject the answers when a checkbox question has no correct answer', () => {
      const options = createOptions([{ text: 'A' }, { text: 'B' }])

      const result = buildChoiceAnswers('checkbox', options)

      expect(result).toEqual({
        ok: false,
        message: 'Pilih minimal satu jawaban benar (Checkbox)',
      })
    })

    it('Must force every answer to be incorrect when the question is a poll', () => {
      const options = createOptions([
        { text: 'A', is_correct: true },
        { text: 'B', is_correct: true },
      ])

      const result = buildChoiceAnswers('poll', options)

      expect(result.ok).toBe(true)
      if (!result.ok) return

      expect(result.value.answers).toEqual([
        { option_text: 'A', is_correct: false },
        { option_text: 'B', is_correct: false },
      ])
    })

    it('Must register the answer image index when an option has an image', () => {
      const image = new File(['image'], 'option.png', { type: 'image/png' })
      const options = createOptions([
        { text: 'A', is_correct: true, image },
        { text: 'B' },
      ])

      const result = buildChoiceAnswers('multiple_choice', options)

      expect(result.ok).toBe(true)
      if (!result.ok) return

      expect(result.value.answers[0].image_index).toBe(0)
      expect(result.value.answerImages).toEqual([image])
    })
  })

  describe('Text answers', () => {
    it('Must trim and drop empty text answers when building the payload', () => {
      const result = buildTextAnswers(['  Jakarta ', '', '   ', 'Bandung'])

      expect(result).toEqual({
        ok: true,
        value: [
          { option_text: 'Jakarta', is_correct: true },
          { option_text: 'Bandung', is_correct: true },
        ],
      })
    })

    it('Must reject the answers when every text answer is empty', () => {
      const result = buildTextAnswers(['', '   '])

      expect(result).toEqual({
        ok: false,
        message: 'Isi minimal 1 kunci jawaban teks',
      })
    })
  })

  describe('Draft operations', () => {
    it('Must keep only the first correct option when the type is multiple choice', () => {
      const options = createOptions([
        { text: 'A', is_correct: true },
        { text: 'B', is_correct: true },
        { text: 'C', is_correct: true },
      ])

      const result = normalizeOptions(options, 'multiple_choice')

      expect(result.map((option) => option.is_correct)).toEqual([
        true,
        false,
        false,
      ])
    })

    it('Must clear every correct option when the type is a poll', () => {
      const options = createOptions([
        { text: 'A', is_correct: true },
        { text: 'B', is_correct: true },
      ])

      const result = normalizeOptions(options, 'poll')

      expect(result.every((option) => !option.is_correct)).toBe(true)
    })

    it('Must promote the first remaining option when the correct option is removed', () => {
      const options = createOptions([
        { text: 'A' },
        { text: 'B', is_correct: true },
        { text: 'C' },
      ])

      const result = removeOptionAt(options, 1)

      expect(result).toHaveLength(2)
      expect(result[0].is_correct).toBe(true)
      expect(result[1].is_correct).toBe(false)
    })
  })
})

describe('Question type inference', () => {
  it('Must return open ended when the question has no options', () => {
    expect(inferQuestionType([])).toBe('open_ended')
  })

  it('Must return multiple choice when the question has exactly one correct option', () => {
    expect(
      inferQuestionType([{ is_correct: true }, { is_correct: false }]),
    ).toBe('multiple_choice')
  })

  it('Must return checkbox when the question has more than one correct option', () => {
    expect(
      inferQuestionType([{ is_correct: true }, { is_correct: true }]),
    ).toBe('checkbox')
  })

  it('Must return poll when the question has options but no correct option', () => {
    expect(
      inferQuestionType([{ is_correct: false }, { is_correct: false }]),
    ).toBe('poll')
  })
})
