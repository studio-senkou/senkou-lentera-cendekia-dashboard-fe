import { useStore } from '@tanstack/react-form'
import { useFieldContext } from '../hooks/form-context'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { type ReactNode } from 'react'

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

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor={name} className="px-1">
        {required && <span className="text-red-500 mr-1">*</span>}
        {label}
        {secondaryLabel && <span className="ml-auto">{secondaryLabel}</span>}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        value={field.state.value}
        placeholder={placeholder}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        required={required}
        className="bg-background"
      />
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  )
}
