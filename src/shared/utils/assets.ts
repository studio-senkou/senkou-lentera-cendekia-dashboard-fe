import { getFileUrl } from '@/shared/lib/utils'

export const getAsset = (path: string): string => {
  return getFileUrl(path) ?? ''
}
