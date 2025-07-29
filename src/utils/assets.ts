import { env } from '@/env'

export const getAsset = (path: string): string => {
  return `${env.VITE_IMAGE_BASE_URL}/${path}`
}
