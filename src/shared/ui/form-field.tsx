import { FormErrorMessage } from './form-error-message'
import { Label } from './label'
import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/utils'

export interface FormFieldProps {
  label: string
  htmlFor: string
  required?: boolean
  error?: string
  secondaryLabel?: ReactNode
  children: ReactNode
  className?: string
}

export function FormField({
  label,
  htmlFor,
  required = false,
  error,
  secondaryLabel,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('grid gap-1', className)}>
      <Label className="gap-1" htmlFor={htmlFor}>
        {required && <span className="text-destructive text-base">*</span>}
        <span className="text-sm">{label}</span>
        {secondaryLabel}
      </Label>
      {children}
      <FormErrorMessage showError={!!error} message={error || ''} />
    </div>
  )
}

export function fieldErrorMessage(
  errors: Array<string | { message: string }> | undefined,
): string | undefined {
  if (!errors?.length) return undefined

  const message = errors
    .map((error) => (typeof error === 'string' ? error : error.message))
    .filter(Boolean)
    .join(', ')

  return message || undefined
}
