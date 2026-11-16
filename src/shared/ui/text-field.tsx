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
  error?: string
  onChange?: (value: string) => void
}

export function TextField({
  type = 'text',
  label,
  placeholder,
  name,
  required = false,
  secondaryLabel,
  error: errorOverride,
  onChange,
}: TextFieldProps) {
  const field = useFieldContext<string>()
  const errors = useStore(field.store, (state) => state.meta.errors)
  const fieldError = fieldErrorMessage(errors)
  const error =
    errorOverride ?? (field.state.meta.isTouched ? fieldError : undefined)

  return (
    <FormField
      label={label}
      htmlFor={name}
      required={required}
      error={error}
      secondaryLabel={secondaryLabel}
    >
      <Input
        id={name}
        name={name}
        type={type}
        value={field.state.value}
        placeholder={placeholder}
        onChange={(event) => {
          field.handleChange(event.target.value)
          onChange?.(event.target.value)
        }}
        onBlur={field.handleBlur}
        required={required}
      />
    </FormField>
  )
}
