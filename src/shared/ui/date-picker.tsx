import { useStore } from '@tanstack/react-form'
import { useFieldContext } from '../hooks/form-context'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { Calendar } from '@/shared/ui/calendar'
import { CalendarIcon } from 'lucide-react'
import { useState } from 'react'

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

export function DatePicker({
  label,
  name,
  required = false,
}: {
  label: string
  name: string
  required?: boolean
}) {
  const field = useFieldContext<string>()
  const errors = useStore(field.store, (state) => state.meta.errors)
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState<Date | undefined>(undefined)

  const date = field.state.value ? parseLocalDate(field.state.value) : undefined

  function parseLocalDate(dateString: string): Date | undefined {
    if (!dateString) return undefined

    const [year, month, day] = dateString.split('-').map(Number)

    return new Date(year, month - 1, day)
  }

  function formatDate(date?: Date): string {
    if (!date) return ''

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }

  function isValidDate(date: Date) {
    return !isNaN(date.getTime())
  }

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor={name} className="px-1">
        {required && <span className="text-red-500 mr-1">*</span>}
        {label}
      </Label>
      <div className="relative flex gap-2">
        <Input
          id={name}
          name={name}
          type="date"
          value={field.state.value}
          placeholder="YYYY-MM-DD"
          className="bg-background pr-10 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden"
          onChange={(e) => {
            field.handleChange(e.target.value)
            const d = parseLocalDate(e.target.value)
            if (d && isValidDate(d)) setMonth(d)
          }}
          onBlur={field.handleBlur}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setOpen(true)
            }
          }}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id={`${name}-picker`}
              variant="ghost"
              className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
              tabIndex={-1}
              type="button"
            >
              <CalendarIcon className="size-3.5" />
              <span className="sr-only">Select date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto overflow-hidden p-0"
            align="end"
            alignOffset={-8}
            sideOffset={10}
          >
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              month={month ?? date}
              onMonthChange={setMonth}
              onSelect={(selectedDate) => {
                if (selectedDate) {
                  const formattedDate = formatDate(selectedDate)
                  field.handleChange(formattedDate)
                  setMonth(selectedDate)
                  setOpen(false)
                }
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  )
}
