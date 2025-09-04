import { toast } from 'sonner'
import { http } from '@/shared/lib/axios'
import type { Article } from '@/shared/types/response'

export interface CreateArticleRequest {
  title: string
  content: string
}

export const createArticle = async (
  data: CreateArticleRequest,
): Promise<void> => {
  try {
    const response = await http.post('/blogs', data)

    if (response.status !== 201) {
      throw new Error('Failed to create blog')
    }

    toast.success('Blog created successfully')
    return response.data
  } catch (error) {
    toast.error('Failed to create blog. Please try again.')
    throw error
  }
}

export const getArticles = async (): Promise<Article[]> => {
  try {
    const response = await http.get('/blogs')
    return response.data.data as Article[]
  } catch (error) {
    return []
  }
}

export const updateArticle = async (
  id: number,
  data: Partial<CreateArticleRequest>,
): Promise<void> => {
  try {
    const response = await http.put(`/blogs/${id}`, data)

    if (response.status !== 200) {
      throw new Error('Failed to update blog')
    }

    toast.success('Blog updated successfully')
  } catch (error) {
    toast.error('Failed to update blog. Please try again.')
    throw error
  }
}

export const deleteArticle = async (id: number): Promise<void> => {
  try {
    const response = await http.delete(`/blogs/${id}`)

    if (response.status !== 200) {
      toast.error('Failed to delete article')
    }

    toast.success('Article deleted successfully')
    return response.data
  } catch (error) {
    toast.error('Failed to delete article, please try again.')
  }
}
