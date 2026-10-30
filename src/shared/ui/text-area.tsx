import { useStore } from '@tanstack/react-form'

import { useFieldContext } from '../hooks/form-context'
import { FormField, fieldErrorMessage } from '@/shared/ui/form-field'
import { Textarea as ShadcnTextarea } from '@/shared/ui/textarea'
import { cn } from '@/shared/lib/utils'

export function TextArea({
  label,
  rows = 3,
  required = false,
  className = '',
}: {
  label: string
  rows?: number
  required?: boolean
  className?: string
}) {
  const field = useFieldContext<string>()
  const errors = useStore(field.store, (state) => state.meta.errors)
  const error = fieldErrorMessage(errors)

  return (
    <FormField
      label={label}
      htmlFor={field.name}
      required={required}
      error={field.state.meta.isTouched ? error : undefined}
    >
      <ShadcnTextarea
        id={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        className={cn('resize-vertical w-full break-words', className)}
        style={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
        }}
        rows={rows}
        onChange={(e) => field.handleChange(e.target.value)}
        required={required}
      />
    </FormField>
  )
}
