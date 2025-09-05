import { useStore } from '@tanstack/react-form'
import { useFieldContext } from '../hooks/form-context'
import { Combobox as ComboboxComponent } from '@/shared/ui/combobox'
import type { ComboboxOption } from '@/shared/ui/combobox'
import { Label } from './label'
import { useCallback } from 'react'

function ErrorMessages({
  errors,
}: {
  errors: Array<string | { message: string }>
}) {
  return (
    <>
      {errors.map((error) => (
        <div
          key={typeof error === 'string' ? error : error.message}
          className="text-red-500 mt-1 text-sm"
        >
          {typeof error === 'string' ? error : error.message}
        </div>
      ))}
    </>
  )
}

export interface ComboboxFieldProps {
  label: string
  options: ComboboxOption[]
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  loading?: boolean
  required?: boolean
}

export function Combobox({
  label,
  options = [],
  placeholder,
  searchPlaceholder,
  emptyMessage,
  loading = false,
  required = false,
}: ComboboxFieldProps) {
  const field = useFieldContext<string>()
  const errors = useStore(field.store, (state) => state.meta.errors)

  const handleValueChange = useCallback(
    (value: string) => {
      console.log(value)
      field.handleChange(value)
    },
    [field],
  )

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor={field.name} className="px-1">
        {required && <span className="text-red-500 mr-1">*</span>}
        {label}
      </Label>

      <ComboboxComponent
        options={options}
        value={field.state.value || ''}
        onValueChange={handleValueChange}
        placeholder={placeholder}
        searchPlaceholder={searchPlaceholder}
        emptyMessage={emptyMessage}
        loading={loading}
      />
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  )
}
