import { useId } from 'react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { FormField } from '@/shared/ui/form-field'
import {
  QUESTION_TYPES,
  type QuestionType,
  type QuestionTypeValue,
} from '@/features/quizzes/types'

export interface QuestionTypeSelectProps {
  value: QuestionTypeValue
  onChange: (value: QuestionType) => void
  required?: boolean
  error?: string | null
  disabled?: boolean
  className?: string
}

export function QuestionTypeSelect({
  value,
  onChange,
  required = false,
  error,
  disabled = false,
  className,
}: QuestionTypeSelectProps) {
  const id = useId()

  return (
    <FormField
      label="Tipe Soal (Question Type)"
      htmlFor={id}
      required={required}
      error={error ?? undefined}
      className={className}
    >
      <Select
        value={value}
        disabled={disabled}
        onValueChange={(val) => onChange(val as QuestionType)}
      >
        <SelectTrigger
          id={id}
          aria-required={required}
          aria-invalid={Boolean(error)}
          className="w-full h-10 rounded-xl bg-white"
        >
          <SelectValue placeholder="Pilih tipe soal..." />
        </SelectTrigger>
        <SelectContent>
          {QUESTION_TYPES.map((t) => (
            <SelectItem key={t.value} value={t.value}>
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-900">{t.label}</span>
                <span className="text-xs text-muted-foreground">
                  ({t.hint})
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  )
}
