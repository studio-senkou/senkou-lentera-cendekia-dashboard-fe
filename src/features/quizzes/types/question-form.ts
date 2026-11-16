import type { QuizQuestion } from '@/shared/types/response'

export interface QuestionFormOptions {
  quizId: number
  question?: QuizQuestion | null
  onSuccess?: () => void
}

export interface QuestionFormProps extends QuestionFormOptions {
  className?: string
}

export interface QuestionFormRef {
  submit: () => Promise<void>
}
