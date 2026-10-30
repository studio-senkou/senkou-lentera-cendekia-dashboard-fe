import { useStore } from '@tanstack/react-form'

import { useFieldContext } from '../hooks/form-context'
import { FormErrorMessage } from '@/shared/ui/form-error-message'
import { fieldErrorMessage } from '@/shared/ui/form-field'
import { Label } from '@/shared/ui/label'
import { Switch as ShadcnSwitch } from '@/shared/ui/switch'

export function Switch({ label }: { label: string }) {
  const field = useFieldContext<boolean>()
  const errors = useStore(field.store, (state) => state.meta.errors)
  const error = fieldErrorMessage(errors)

  return (
    <div className="grid gap-1">
      <div className="flex items-center gap-2">
        <ShadcnSwitch
          id={field.name}
          onBlur={field.handleBlur}
          checked={field.state.value}
          onCheckedChange={(checked) => field.handleChange(checked)}
        />
        <Label htmlFor={field.name}>{label}</Label>
      </div>
      <FormErrorMessage
        showError={field.state.meta.isTouched && !!error}
        message={error || ''}
      />
    </div>
  )
}
