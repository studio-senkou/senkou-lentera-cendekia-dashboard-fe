import { useStore } from '@tanstack/react-form'
import { useFieldContext } from '../hooks/form-context'
import type { ReactNode } from 'react'

import { FormField, fieldErrorMessage } from '@/shared/ui/form-field'
import { Input } from '@/shared/ui/input'

interface TextFieldProps {
  name: string
  label: string
  placeholder?: string
  type?: string
  required?: boolean
  secondaryLabel?: ReactNode
}

export function TextField({
  type = 'text',
  label,
  placeholder,
  name,
  required = false,
  secondaryLabel,
}: TextFieldProps) {
  const field = useFieldContext<string>()
  const errors = useStore(field.store, (state) => state.meta.errors)
  const error = fieldErrorMessage(errors)

  return (
    <FormField
      label={label}
      htmlFor={name}
      required={required}
      error={field.state.meta.isTouched ? error : undefined}
      secondaryLabel={secondaryLabel}
    >
      <Input
        id={name}
        name={name}
        type={type}
        value={field.state.value}
        placeholder={placeholder}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        required={required}
      />
    </FormField>
  )
}
