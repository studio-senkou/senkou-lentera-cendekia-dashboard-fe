import { toast } from 'sonner'
import type { Testimonial } from '@/shared/types/response'
import type {
  PaginationMeta,
  PaginationParams,
} from '@/shared/types/pagination'
import { supabase } from '@/shared/api/supabase'

export interface CreateTestimonialRequest {
  testimoner_name: string
  testimoner_position: string
  testimoner_photo?: string | null
  testimony_text: string
  is_active: boolean
  gender: 'man' | 'woman' | 'man-woman'
}

export const createTestimonial = async (
  data: CreateTestimonialRequest,
): Promise<Testimonial> => {
  try {
    const { data: result, error } = await supabase
      .from('testimonials')
      .insert([
        {
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      throw error
    }

    toast.success('Testimonial created successfully')
    return result as Testimonial
  } catch (error: any) {
    toast.error(
      error?.message || 'Failed to create testimonial. Please try again.',
    )
    console.error(error)
    throw error
  }
}

export const getTestimonials = async (
  pagination?: PaginationParams,
): Promise<{ testimonials: Array<Testimonial>; meta?: PaginationMeta }> => {
  try {
    let query = supabase
      .from('testimonials')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    const term = pagination?.search?.replace(/[%,()]/g, ' ').trim()

    if (term) {
      query = query.or(
        `testimoner_name.ilike.%${term}%,testimoner_position.ilike.%${term}%,testimony_text.ilike.%${term}%`,
      )
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
      testimonials: (result ?? []) as Array<Testimonial>,
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
    return { testimonials: [] }
  }
}

export const updateTestimonial = async (
  id: number,
  data: Partial<CreateTestimonialRequest>,
): Promise<Testimonial> => {
  try {
    const updateData = {
      ...data,
      updated_at: new Date().toISOString(),
    }

    const { data: result, error } = await supabase
      .from('testimonials')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    toast.success('Testimonial updated successfully')
    return result as Testimonial
  } catch (error: any) {
    toast.error(
      error?.message || 'Failed to update testimonial. Please try again.',
    )
    throw error
  }
}

export const deleteTestimonial = async (id: number): Promise<void> => {
  try {
    const { error } = await supabase.from('testimonials').delete().eq('id', id)

    if (error) {
      throw error
    }

    toast.success('Testimonial deleted successfully')
  } catch (error: any) {
    toast.error(
      error?.message || 'Failed to delete testimonial, please try again.',
    )
    throw error
  }
}
