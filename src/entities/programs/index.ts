import { toast } from 'sonner'
import type { Program } from '@/shared/types/response'
import type {
  PaginationMeta,
  PaginationParams,
} from '@/shared/types/pagination'
import { supabase } from '@/shared/api/supabase'

export interface CreateProgramRequest {
  title: string
  description: string
  image_url?: string | null
}

export const createProgram = async (
  data: CreateProgramRequest,
): Promise<Program> => {
  try {
    const { data: result, error } = await supabase
      .from('programs')
      .insert([
        {
          title: data.title,
          description: data.description,
          image_url: data.image_url || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      throw error
    }

    toast.success('Program created successfully')
    return result as Program
  } catch (error: any) {
    toast.error(error?.message || 'Failed to create program. Please try again.')
    console.error(error)
    throw error
  }
}

export const getPrograms = async (
  pagination?: PaginationParams,
): Promise<{ programs: Array<Program>; meta?: PaginationMeta }> => {
  try {
    let query = supabase
      .from('programs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    const term = pagination?.search?.replace(/[%,()]/g, ' ').trim()

    if (term) {
      query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`)
    }

    if (pagination) {
      query = query.range(
        pagination.offset,
        pagination.offset + pagination.limit - 1,
      )
    }

    const { data: result, error, count } = await query

    if (error) {
      throw error
    }

    return {
      programs: (result ?? []) as Array<Program>,
      ...(pagination
        ? {
            meta: {
              total: count ?? 0,
              limit: pagination.limit,
              offset: pagination.offset,
            },
          }
        : {}),
    }
  } catch (error) {
    console.error(error)
    return { programs: [] }
  }
}

export const updateProgram = async (
  id: number,
  data: Partial<CreateProgramRequest>,
): Promise<Program> => {
  try {
    const updateData: any = {
      title: data.title,
      description: data.description,
      updated_at: new Date().toISOString(),
    }

    if (data.image_url !== undefined) {
      updateData.image_url = data.image_url
    }

    const { data: result, error } = await supabase
      .from('programs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    toast.success('Program updated successfully')
    return result as Program
  } catch (error) {
    toast.error('Failed to update program. Please try again.')
    throw error
  }
}

export const deleteProgram = async (id: number): Promise<void> => {
  try {
    const { error } = await supabase.from('programs').delete().eq('id', id)

    if (error) {
      throw error
    }

    toast.success('Program deleted successfully')
  } catch (error) {
    toast.error('Failed to delete program, please try again.')
    throw error
  }
}
