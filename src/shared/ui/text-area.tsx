import { useStore } from '@tanstack/react-form'
import { useFieldContext } from '../hooks/form-context'
import { Textarea as ShadcnTextarea } from '@/shared/ui/textarea'
import { Label } from '@/shared/ui/label'
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

  return (
    <div>
      <Label htmlFor={label} className="mb-2 text-sm">
        {required && <span className="text-red-500 mr-1">*</span>}
        {label}
      </Label>
      <ShadcnTextarea
        id={label}
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
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  )
}
