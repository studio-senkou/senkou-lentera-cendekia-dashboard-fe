import { useStore } from '@tanstack/react-form'
import { useState } from 'react'

import { useFieldContext } from '../hooks/form-context'
import { FormField, fieldErrorMessage } from '@/shared/ui/form-field'
import { Input } from '@/shared/ui/input'

export function NumberField({
  label,
  required = false,
  className = '',
}: {
  label: string
  required?: boolean
  className?: string
}) {
  const field = useFieldContext<number>()
  const errors = useStore(field.store, (state) => state.meta.errors)
  const error = fieldErrorMessage(errors)
  const [value, setValue] = useState(field.state.value)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    if (inputValue === '') {
      setValue('' as unknown as number)
      field.handleChange(undefined as unknown as number)
      return
    }
    const newValue = parseFloat(inputValue)
    if (!isNaN(newValue)) {
      setValue(newValue)
      field.handleChange(newValue)
    }
  }

  return (
    <FormField
      label={label}
      htmlFor={field.name}
      required={required}
      error={field.state.meta.isTouched ? error : undefined}
      className={className}
    >
      <Input
        id={field.name}
        type="number"
        value={value}
        onChange={handleChange}
        onBlur={field.handleBlur}
        required={required}
      />
    </FormField>
  )
}
