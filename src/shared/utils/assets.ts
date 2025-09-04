import { env } from '@/app/env'

export const getAsset = (path: string): string => {
  return `${env.VITE_IMAGE_BASE_URL}/${path}`
}
