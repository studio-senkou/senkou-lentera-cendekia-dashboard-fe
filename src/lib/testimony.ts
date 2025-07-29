import { toast } from 'sonner'
import { http } from './axios'
import type { Testimony } from '@/types/response'

export interface CreateTestimonyPayload {
  testimoner_name: string
  testimoner_current_position: string
  testimoner_previous_position: string
  testimoner_photo?: File
  testimony_text: string
}

export const storeNewTestimony = async ({
  testimoner_name,
  testimoner_current_position,
  testimoner_previous_position,
  testimony_text,
  testimoner_photo,
}: CreateTestimonyPayload) => {
  const formData = new FormData()

  formData.append('testimoner_name', testimoner_name)
  formData.append('testimoner_current_position', testimoner_current_position)
  formData.append('testimoner_previous_position', testimoner_previous_position)
  formData.append('testimony_text', testimony_text)

  if (testimoner_photo) {
    formData.append('testimoner_photo', testimoner_photo)
  }

  try {
    const response = await http.post('/testimonies', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.status === 200 && response.data.status === 'success'
  } catch (error) {
    toast.error('Failed to create testimony')
    return false
  }
}

export const getAllTestimonies = async (): Promise<Testimony[]> => {
  try {
    const response = await http.get('/testimonies')
    return response.data.data.testimonials
  } catch (error) {
    return []
  }
}

export interface UpdateTestimonyPayload {
  testimony_id: number
  testimoner_name: string
  testimoner_current_position: string
  testimoner_previous_position: string
  testimoner_photo?: File
  testimony_text: string
}

export const updateTestimony = async ({
  testimony_id,
  testimoner_name,
  testimoner_current_position,
  testimoner_previous_position,
  testimony_text,
  testimoner_photo,
}: UpdateTestimonyPayload): Promise<void> => {
  const formData = new FormData()

  formData.append('testimony_id', String(testimony_id))
  formData.append('testimoner_name', testimoner_name)
  formData.append('testimoner_current_position', testimoner_current_position)
  formData.append('testimoner_previous_position', testimoner_previous_position)
  formData.append('testimony_text', testimony_text)

  if (testimoner_photo) {
    formData.append('testimoner_photo', testimoner_photo)
  }

  try {
    const response = await http.put(`/testimonies/${testimony_id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    if (response.status === 200 && response.data.status === 'success') {
      toast.success('Testimony updated successfully')
    } else {
      toast.error('Failed to update testimony')
    }
  } catch (error) {
    toast.error('Failed to update testimony')
    throw error
  }
}

export const deleteTestimony = async (testimonyId: number): Promise<void> => {
  try {
    const response = await http.delete(`/testimonies/${testimonyId}`)
    if (response.status === 200 && response.data.status === 'success') {
      toast.success('Testimony deleted successfully')
    } else {
      toast.error('Failed to delete testimony')
    }
  } catch (error) {
    toast.error('Failed to delete testimony')
    throw error
  }
}
