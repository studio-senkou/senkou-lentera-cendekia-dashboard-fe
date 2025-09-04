import { useStore } from '@tanstack/react-form'
import { useFieldContext } from '../hooks/form-context'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { useState } from 'react'
import { cn } from '@/shared/lib/utils'

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
  const [value, setValue] = useState(field.state.value)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value)
    if (!isNaN(newValue)) {
      setValue(newValue)
      field.handleChange(newValue)
    } else {
      setValue(0)
      field.handleChange(0)
    }
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <Label htmlFor={label} className="px-1">
        {required && <span className="text-red-500 mr-1">*</span>}
        {label}
      </Label>
      <Input
        id={label}
        type="number"
        value={value}
        onChange={handleChange}
        onBlur={field.handleBlur}
        className="bg-background"
        required={required}
      />
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  )
}
