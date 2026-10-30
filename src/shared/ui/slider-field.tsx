import { useStore } from '@tanstack/react-form'

import { useFieldContext } from '../hooks/form-context'
import { FormField, fieldErrorMessage } from '@/shared/ui/form-field'
import { Slider as ShadcnSlider } from '@/shared/ui/slider'

export function Slider({ label }: { label: string }) {
  const field = useFieldContext<number>()
  const errors = useStore(field.store, (state) => state.meta.errors)
  const error = fieldErrorMessage(errors)

  return (
    <FormField
      label={label}
      htmlFor={field.name}
      error={field.state.meta.isTouched ? error : undefined}
      className="gap-2"
    >
      <ShadcnSlider
        id={field.name}
        onBlur={field.handleBlur}
        value={[field.state.value]}
        onValueChange={(value) => field.handleChange(value[0])}
      />
    </FormField>
  )
}
