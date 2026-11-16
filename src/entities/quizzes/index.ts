import { toast } from 'sonner'

import type {
  Quiz,
  QuizAttempt,
  QuizDetail,
  QuizOption,
  QuizQuestion,
} from '@/shared/types/response'
import type {
  CursorPaginationMeta,
  PaginationMeta,
  PaginationParams,
} from '@/shared/types/pagination'
import { http } from '@/shared/lib/axios'

export interface CreateQuizRequest {
  title: string
  description?: string | null
  passing_score: number
  time_limit_minutes?: number | null
  is_active?: boolean
  scoring_method?: 'standard' | 'tka_irt_2pl'
  reporting_scale?: 'sd_smp' | 'sma_smk'
}

export interface UpdateQuizRequest extends CreateQuizRequest {}

export interface CreateQuestionAnswer {
  option_text: string
  is_correct: boolean
  image_index?: number
}

export interface CreateQuestionRequest {
  question_text: string
  question_type?: string
  order_number?: number
  image_url?: File | null
  discrimination?: number | null
  difficulty?: number | null
  calibration_status?: 'calibrated' | 'uncalibrated' | 'simulated'
  calibration_version?: string | null
  answers?: Array<CreateQuestionAnswer>
  answer_images?: Array<File>
}

export interface UpdateQuestionRequest extends CreateQuestionRequest {}

export interface CreateOptionRequest {
  option_text: string
  image_url?: File | null
  is_correct?: boolean
  order_number?: number
}

export interface UpdateOptionRequest extends CreateOptionRequest {}

export const getQuizzes = async (
  pagination?: PaginationParams,
): Promise<{ quizzes: Array<Quiz>; meta?: PaginationMeta }> => {
  try {
    const response = await http.get('/admin/quizzes', {
      params: pagination ?? undefined,
    })
    return {
      quizzes: response.data.data ?? [],
      meta: response.data.meta,
    }
  } catch {
    toast.error('Failed to fetch quizzes')
    return { quizzes: [] }
  }
}

export const getQuizQuestions = async (
  quizId: number,
  params: { limit: number; cursor?: number | null },
): Promise<{ questions: Array<QuizQuestion>; meta: CursorPaginationMeta }> => {
  const response = await http.get(`/admin/quizzes/${quizId}/questions`, {
    params: {
      limit: params.limit,
      ...(params.cursor !== null && params.cursor !== undefined
        ? { cursor: params.cursor }
        : {}),
    },
  })
  return {
    questions: response.data.data ?? [],
    meta: response.data.meta,
  }
}

export const getQuizById = async (
  quizId: number,
): Promise<QuizDetail | null> => {
  try {
    const response = await http.get(`/admin/quizzes/${quizId}`)
    return response.data.data
  } catch {
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
    const formData = new FormData()
    formData.append('question_text', data.question_text)
    if (data.question_type) {
      formData.append('question_type', data.question_type)
    }
    if (data.order_number != null) {
      formData.append('order_number', String(data.order_number))
    }
    if (data.image_url instanceof File) {
      formData.append('image', data.image_url)
    }
    if (data.discrimination !== undefined && data.discrimination !== null) {
      formData.append('discrimination', String(data.discrimination))
    }
    if (data.difficulty !== undefined && data.difficulty !== null) {
      formData.append('difficulty', String(data.difficulty))
    }
    if (data.calibration_status) {
      formData.append('calibration_status', data.calibration_status)
    }
    if (data.calibration_version) {
      formData.append('calibration_version', data.calibration_version)
    }
    if (data.answers && data.answers.length > 0) {
      formData.append('answers', JSON.stringify(data.answers))
    }
    for (const file of data.answer_images ?? []) {
      formData.append('answer_images', file)
    }
    const response = await http.post(
      `/admin/quizzes/${quizId}/questions`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
    toast.success('Question created successfully')
    return response.data.data as QuizQuestion
  } catch (error) {
    toast.error('Failed to create question')
    throw error
  }
}

export const importQuizQuestions = async (quizId: number, file: File) => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    const response = await http.post(
      `/admin/quizzes/${quizId}/questions/import`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
    toast.success('Questions imported successfully')
    return response.data
  } catch (error) {
    toast.error('Failed to import questions')
    throw error
  }
}

export const updateQuestion = async (
  quizId: number,
  questionId: number,
  data: UpdateQuestionRequest,
) => {
  try {
    const formData = new FormData()
    formData.append('question_text', data.question_text)
    if (data.question_type) {
      formData.append('question_type', data.question_type)
    }
    if (data.order_number != null) {
      formData.append('order_number', String(data.order_number))
    }
    if (data.image_url instanceof File) {
      formData.append('image', data.image_url)
    }
    if (data.discrimination !== undefined && data.discrimination !== null) {
      formData.append('discrimination', String(data.discrimination))
    }
    if (data.difficulty !== undefined && data.difficulty !== null) {
      formData.append('difficulty', String(data.difficulty))
    }
    if (data.calibration_status) {
      formData.append('calibration_status', data.calibration_status)
    }
    if (data.calibration_version) {
      formData.append('calibration_version', data.calibration_version)
    }
    const response = await http.put(
      `/admin/quizzes/${quizId}/questions/${questionId}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
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
    const formData = new FormData()
    formData.append('option_text', data.option_text)
    formData.append('is_correct', String(data.is_correct ?? false))
    if (data.image_url instanceof File) {
      formData.append('image', data.image_url)
    }
    const response = await http.post(
      `/admin/quizzes/${quizId}/questions/${questionId}/options`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
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
    const formData = new FormData()
    formData.append('option_text', data.option_text)
    formData.append('is_correct', String(data.is_correct ?? false))
    if (data.image_url instanceof File) {
      formData.append('image', data.image_url)
    }
    const response = await http.put(
      `/admin/quizzes/${quizId}/questions/${questionId}/options/${optionId}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
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
  pagination?: PaginationParams,
): Promise<{ attempts: Array<QuizAttempt>; meta?: PaginationMeta }> => {
  try {
    const response = await http.get(`/admin/quizzes/${quizId}/attempts`, {
      params: pagination ?? undefined,
    })
    return {
      attempts: response.data.data ?? [],
      meta: response.data.meta,
    }
  } catch {
    toast.error('Failed to fetch quiz attempts')
    return { attempts: [] }
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

export interface CalibrationItemInput {
  question_id: number
  discrimination: number
  difficulty: number
  calibration_version?: string
}

export const importQuizCalibration = async (
  quizId: number,
  payload: {
    calibration_version?: string
    items?: Array<CalibrationItemInput>
    file?: File
  },
) => {
  try {
    if (payload.file) {
      const formData = new FormData()
      formData.append('file', payload.file)
      if (payload.calibration_version) {
        formData.append('calibration_version', payload.calibration_version)
      }
      const response = await http.post(
        `/admin/quizzes/${quizId}/calibration/import`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      )
      toast.success('Kalibrasi IRT berhasil diimpor')
      return response.data
    }

    const response = await http.post(
      `/admin/quizzes/${quizId}/calibration/import`,
      payload,
    )
    toast.success('Kalibrasi IRT berhasil diimpor')
    return response.data
  } catch (error) {
    toast.error('Gagal mengimpor kalibrasi IRT')
    throw error
  }
}
