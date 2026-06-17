import { toast } from 'sonner'
import type { Testimonial } from '@/shared/types/response'
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
    toast.error(error?.message || 'Failed to create testimonial. Please try again.')
    console.error(error)
    throw error
  }
}

export const getTestimonials = async (): Promise<Array<Testimonial>> => {
  try {
    const { data: result, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return result as Array<Testimonial>
  } catch (error) {
    console.error(error)
    return []
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
    toast.error(error?.message || 'Failed to update testimonial. Please try again.')
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
    toast.error(error?.message || 'Failed to delete testimonial, please try again.')
    throw error
  }
}
