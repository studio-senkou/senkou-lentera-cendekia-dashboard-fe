import { useStore } from '@tanstack/react-form'

import { useFieldContext, useFormContext } from '../hooks/form-context'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea as ShadcnTextarea } from '@/components/ui/textarea'
import * as ShadcnSelect from '@/components/ui/select'
import { Slider as ShadcnSlider } from '@/components/ui/slider'
import { Switch as ShadcnSwitch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useState, type ReactNode } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { CalendarIcon } from 'lucide-react'
import { Calendar } from './ui/calendar'

export function SubscribeButton({ label }: { label: string }) {
  const form = useFormContext()
  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button type="submit" disabled={isSubmitting}>
          {label}
        </Button>
      )}
    </form.Subscribe>
  )
}

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

export function TextArea({
  label,
  rows = 3,
  required = false,
}: {
  label: string
  rows?: number
  required?: boolean
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
        rows={rows}
        onChange={(e) => field.handleChange(e.target.value)}
        required={required}
      />
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  )
}

export function Select({
  label,
  values,
  placeholder,
  required = false,
}: {
  label: string
  values: Array<{ label: string; value: string }>
  placeholder?: string
  required?: boolean
}) {
  const field = useFieldContext<string>()
  const errors = useStore(field.store, (state) => state.meta.errors)

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor={field.name} className="px-1">
        {required && <span className="text-red-500 mr-1">*</span>}
        {label}
      </Label>
      <ShadcnSelect.Select
        name={field.name}
        value={field.state.value}
        onValueChange={(value) => field.handleChange(value)}
        required={required}
      >
        <ShadcnSelect.SelectTrigger className="w-full">
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
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  )
}

export function Slider({ label }: { label: string }) {
  const field = useFieldContext<number>()
  const errors = useStore(field.store, (state) => state.meta.errors)

  return (
    <div>
      <Label htmlFor={label} className="mb-2 text-sm">
        {label}
      </Label>
      <ShadcnSlider
        id={label}
        onBlur={field.handleBlur}
        value={[field.state.value]}
        onValueChange={(value) => field.handleChange(value[0])}
      />
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  )
}

export function Switch({ label }: { label: string }) {
  const field = useFieldContext<boolean>()
  const errors = useStore(field.store, (state) => state.meta.errors)

  return (
    <div>
      <div className="flex items-center gap-2">
        <ShadcnSwitch
          id={label}
          onBlur={field.handleBlur}
          checked={field.state.value}
          onCheckedChange={(checked) => field.handleChange(checked)}
        />
        <Label htmlFor={label}>{label}</Label>
      </div>
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
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

  const date = field.state.value ? new Date(field.state.value) : undefined

  function formatDate(date?: Date) {
    if (!date) return ''
    return date.toISOString().split('T')[0]
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
            const d = new Date(e.target.value)
            if (isValidDate(d)) setMonth(d)
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
              onSelect={(d) => {
                if (d) {
                  field.handleChange(formatDate(d))
                  setMonth(d)
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

export function TimePicker({
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

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor={name} className="px-1">
        {required && <span className="text-red-500 mr-1">*</span>}
        {label}
      </Label>
      <Input
        type="time"
        id={name}
        name={name}
        step="1"
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        placeholder="HH:MM:SS"
        className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
      />
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  )
}
