interface ApiErrorResponse {
  status?: number
  data?: {
    message?: string
    error?: string
  }
}

export function readApiError(
  error: unknown,
  fallback: string,
): { status: number | undefined; message: string } {
  const response = (error as { response?: ApiErrorResponse }).response
  const message = response?.data?.error ?? response?.data?.message ?? fallback

  return {
    status: response?.status,
    message,
  }
}
