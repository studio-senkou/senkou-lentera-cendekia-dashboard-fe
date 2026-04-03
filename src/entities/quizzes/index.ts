import { toast } from 'sonner'

import { http } from '@/shared/lib/axios'
import type {
  Quiz,
  QuizAttempt,
  QuizDetail,
  QuizOption,
  QuizQuestion,
} from '@/shared/types/response'

export interface CreateQuizRequest {
  title: string
  description?: string | null
  passing_score: number
  time_limit_minutes?: number | null
  is_active?: boolean
}

export interface UpdateQuizRequest extends CreateQuizRequest {}

export interface CreateQuestionRequest {
  question_text: string
  order_number?: number
}

export interface UpdateQuestionRequest extends CreateQuestionRequest {}

export interface CreateOptionRequest {
  option_text: string
  is_correct?: boolean
  order_number?: number
}

export interface UpdateOptionRequest extends CreateOptionRequest {}

export const getQuizzes = async (): Promise<Array<Quiz>> => {
  try {
    const response = await http.get('/admin/quizzes')
    return response.data.data ?? []
  } catch (error) {
    toast.error('Failed to fetch quizzes')
    return []
  }
}

export const getQuizById = async (
  quizId: number,
): Promise<QuizDetail | null> => {
  try {
    const response = await http.get(`/admin/quizzes/${quizId}`)
    return response.data.data
  } catch (error) {
    toast.error('Failed to fetch quiz detail')
    return null
  }
}

export const createQuiz = async (data: CreateQuizRequest) => {
  try {
    const response = await http.post('/admin/quizzes', data)
    toast.success('Quiz created successfully')
    return response.data.data as Quiz
  } catch (error) {
    toast.error('Failed to create quiz')
    throw error
  }
}

export const updateQuiz = async (quizId: number, data: UpdateQuizRequest) => {
  try {
    const response = await http.put(`/admin/quizzes/${quizId}`, data)
    toast.success('Quiz updated successfully')
    return response.data.data as Quiz
  } catch (error) {
    toast.error('Failed to update quiz')
    throw error
  }
}

export const deleteQuiz = async (quizId: number) => {
  try {
    const response = await http.delete(`/admin/quizzes/${quizId}`)
    toast.success('Quiz deleted successfully')
    return response.data
  } catch (error) {
    toast.error('Failed to delete quiz')
    throw error
  }
}

export const createQuestion = async (
  quizId: number,
  data: CreateQuestionRequest,
) => {
  try {
    const response = await http.post(`/admin/quizzes/${quizId}/questions`, data)
    toast.success('Question created successfully')
    return response.data.data as QuizQuestion
  } catch (error) {
    toast.error('Failed to create question')
    throw error
  }
}

export const updateQuestion = async (
  quizId: number,
  questionId: number,
  data: UpdateQuestionRequest,
) => {
  try {
    const response = await http.put(
      `/admin/quizzes/${quizId}/questions/${questionId}`,
      data,
    )
    toast.success('Question updated successfully')
    return response.data.data as QuizQuestion
  } catch (error) {
    toast.error('Failed to update question')
    throw error
  }
}

export const deleteQuestion = async (quizId: number, questionId: number) => {
  try {
    const response = await http.delete(
      `/admin/quizzes/${quizId}/questions/${questionId}`,
    )
    toast.success('Question deleted successfully')
    return response.data
  } catch (error) {
    toast.error('Failed to delete question')
    throw error
  }
}

export const createQuestionOption = async (
  quizId: number,
  questionId: number,
  data: CreateOptionRequest,
) => {
  try {
    const response = await http.post(
      `/admin/quizzes/${quizId}/questions/${questionId}/options`,
      data,
    )
    toast.success('Option created successfully')
    return response.data.data as QuizOption
  } catch (error) {
    toast.error('Failed to create option')
    throw error
  }
}

export const updateQuestionOption = async (
  quizId: number,
  questionId: number,
  optionId: number,
  data: UpdateOptionRequest,
) => {
  try {
    const response = await http.put(
      `/admin/quizzes/${quizId}/questions/${questionId}/options/${optionId}`,
      data,
    )
    toast.success('Option updated successfully')
    return response.data.data as QuizOption
  } catch (error) {
    toast.error('Failed to update option')
    throw error
  }
}

export const deleteQuestionOption = async (
  quizId: number,
  questionId: number,
  optionId: number,
) => {
  try {
    const response = await http.delete(
      `/admin/quizzes/${quizId}/questions/${questionId}/options/${optionId}`,
    )
    toast.success('Option deleted successfully')
    return response.data
  } catch (error) {
    toast.error('Failed to delete option')
    throw error
  }
}

export const getQuizAttempts = async (
  quizId: number,
): Promise<Array<QuizAttempt>> => {
  try {
    const response = await http.get(`/admin/quizzes/${quizId}/attempts`)
    return response.data.data ?? []
  } catch (error) {
    toast.error('Failed to fetch quiz attempts')
    return []
  }
}

export const resetQuizAttempt = async (quizId: number, userId: number) => {
  try {
    const response = await http.post(`/quiz/${quizId}/reset`, {
      user_id: userId,
    })
    toast.success('Attempt reset successfully')
    return response.data
  } catch (error) {
    toast.error('Failed to reset quiz attempt')
    throw error
  }
}
