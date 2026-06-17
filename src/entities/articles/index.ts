import { toast } from 'sonner'
import type { Article } from '@/shared/types/response'
import { supabase } from '@/shared/api/supabase'

export interface CreateArticleRequest {
  title: string
  content: string
  author_name?: string
  author_email?: string
  author_role?: string
}

export const createArticle = async (
  data: CreateArticleRequest,
): Promise<Article> => {
  try {
    const { data: result, error } = await supabase
      .from('articles')
      .insert([
        {
          title: data.title,
          content: data.content,
          author_name: data.author_name || 'Admin',
          author_email: data.author_email || 'admin@admin.com',
          author_role: data.author_role || 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      throw error
    }

    toast.success('Article created successfully')
    return result as Article
  } catch (error: any) {
    toast.error(error?.message || 'Failed to create article. Please try again.')
    console.error(error)
    throw error
  }
}

export const getArticles = async (): Promise<Array<Article>> => {
  try {
    const { data: result, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return result as Array<Article>
  } catch (error) {
    console.error(error)
    return []
  }
}

export const updateArticle = async (
  id: number,
  data: Partial<CreateArticleRequest>,
): Promise<Article> => {
  try {
    const { data: result, error } = await supabase
      .from('articles')
      .update({
        title: data.title,
        content: data.content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    toast.success('Article updated successfully')
    return result as Article
  } catch (error) {
    toast.error('Failed to update article. Please try again.')
    throw error
  }
}

export const deleteArticle = async (id: number): Promise<void> => {
  try {
    const { error } = await supabase.from('articles').delete().eq('id', id)

    if (error) {
      throw error
    }

    toast.success('Article deleted successfully')
  } catch (error) {
    toast.error('Failed to delete article, please try again.')
    throw error
  }
}
