import { useStore } from '@tanstack/react-form'

import { useFieldContext } from '../hooks/form-context'
import { FormField, fieldErrorMessage } from '@/shared/ui/form-field'
import * as ShadcnSelect from '@/shared/ui/select'

export function Select({
  label,
  values,
  placeholder,
  required = false,
  onChange,
}: {
  label: string
  values: Array<{ label: string; value: string }>
  placeholder?: string
  required?: boolean
  onChange?: (value: string) => void
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
      <ShadcnSelect.Select
        name={field.name}
        value={field.state.value}
        onValueChange={(value) => {
          field.handleChange(value)
          onChange?.(value)
        }}
        required={required}
      >
        <ShadcnSelect.SelectTrigger
          id={field.name}
          className="w-full"
          onBlur={field.handleBlur}
        >
          <ShadcnSelect.SelectValue placeholder={placeholder} />
        </ShadcnSelect.SelectTrigger>
        <ShadcnSelect.SelectContent>
          <ShadcnSelect.SelectGroup>
            <ShadcnSelect.SelectLabel>{label}</ShadcnSelect.SelectLabel>
            {values.map((value) => (
              <ShadcnSelect.SelectItem key={value.value} value={value.value}>
                {value.label}
              </ShadcnSelect.SelectItem>
            ))}
          </ShadcnSelect.SelectGroup>
        </ShadcnSelect.SelectContent>
      </ShadcnSelect.Select>
    </FormField>
  )
}
