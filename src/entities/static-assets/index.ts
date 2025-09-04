import { toast } from 'sonner'
import { http } from '@/shared/lib/axios'

export const storeNewAsset = async (asset: File) => {
  const formData = new FormData()

  formData.append('asset', asset)

  try {
    const response = await http.post('/static-assets', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.status === 200 && response.data.status === 'success'
  } catch (error) {
    toast.error('Failed to upload asset')
    return false
  }
}

export const getAllStaticAssets = async () => {
  try {
    const response = await http.get('/static-assets')
    return response.data.data
  } catch (error) {
    return []
  }
}

export const deleteStaticAsset = async (assetID: number) => {
  try {
    const response = await http.delete(`/static-assets/${assetID}`)
    if (response.status === 200 && response.data.status === 'success') {
      toast.success('Asset deleted successfully')
      return true
    }
    return false
  } catch (error) {
    toast.error('Failed to delete asset')
    return false
  }
}
