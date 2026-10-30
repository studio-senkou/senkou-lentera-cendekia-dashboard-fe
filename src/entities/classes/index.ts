import { http } from '@/shared/lib/axios'
import type { Class } from '@/shared/types/response'
import type {
  PaginationMeta,
  PaginationParams,
} from '@/shared/types/pagination'
import { toast } from 'sonner'

export interface CreateClass {
  classname: string
}

export const createClass = async ({ classname }: CreateClass) => {
  try {
    const response = await http.post('/classes', { classname })
    return response.data.data
  } catch (error) {
    toast.error('Failed to create new class')
    throw error
  }
}

export const fetchClasses = async (
  pagination?: PaginationParams,
): Promise<{ classes: Array<Class>; meta?: PaginationMeta }> => {
  try {
    const response = await http.get('/classes', {
      params: pagination ?? undefined,
    })
    return {
      classes: response.data.data.classes ?? [],
      meta: response.data.meta,
    }
  } catch {
    toast.error('Failed to fetch classes')
    return { classes: [] }
  }
}

export interface ClassDropdown {
  id: string
  name: string
}

export const fetchClassesForDropdown = async () => {
  try {
    const response = await http.get('/classes/dropdown')
    return response.data.data.map((item: ClassDropdown) => ({
      value: item.id,
      label: item.name,
    }))
  } catch {
    toast.error('Failed to fetch classes for dropdown')
    return []
  }
}

export const deleteClass = async (classId: number) => {
  try {
    const response = await http.delete(`/classes/${classId}`)
    toast.success('Kelas berhasil dihapus')
    return response.data
  } catch (error) {
    toast.error('Gagal menghapus kelas')
    throw error
  }
}

export const updateClass = async (classId: number, classname: string) => {
  try {
    const response = await http.put(`/classes/${classId}`, { classname })
    toast.success('Kelas berhasil diperbarui')
    return response.data.data
  } catch (error) {
    toast.error('Gagal memperbarui kelas')
    throw error
  }
}
