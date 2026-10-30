import { cn } from '@/shared/lib/utils'

export interface FormErrorMessageProps {
  showError: boolean
  message: string
  className?: string
}

export function FormErrorMessage({
  showError,
  message,
  className,
}: FormErrorMessageProps) {
  if (!showError) return null

  return (
    <div
      data-testid="shared-form-error-message-error"
      className={cn(
        'text-destructive text-sm animate-in fade-in slide-in-from-top-1 duration-200',
        className,
      )}
    >
      {message}
    </div>
  )
}
