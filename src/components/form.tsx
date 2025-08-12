import { useStore } from '@tanstack/react-form'

import { useFieldContext, useFormContext } from '../hooks/form-context'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea as ShadcnTextarea } from '@/components/ui/textarea'
import * as ShadcnSelect from '@/components/ui/select'
import { Slider as ShadcnSlider } from '@/components/ui/slider'
import { Switch as ShadcnSwitch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useState, type ReactNode, useRef } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { CalendarIcon, Upload, X, File } from 'lucide-react'
import { Calendar } from './ui/calendar'
import { cn } from '@/lib/utils'

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

export function TimePicker({
  label,
  name,
  required = false,
  format = '24h',
  showSeconds = false,
}: {
  label: string
  name: string
  required?: boolean
  format?: '12h' | '24h'
  showSeconds?: boolean
}) {
  const field = useFieldContext<string>()
  const errors = useStore(field.store, (state) => state.meta.errors)
  const [open, setOpen] = useState(false)

  const parseTime = (timeString: string) => {
    if (!timeString) return { hours: 0, minutes: 0, seconds: 0, period: 'AM' }

    const [time, period] = timeString.split(' ')
    const timeParts = time.split(':')
    const hours = parseInt(timeParts[0]) || 0
    const minutes = parseInt(timeParts[1]) || 0
    const seconds = parseInt(timeParts[2] || '0') || 0

    return {
      hours,
      minutes,
      seconds,
      period: period || 'AM',
    }
  }

  const formatTime = (
    hours: number,
    minutes: number,
    seconds: number,
    period?: string,
  ) => {
    const h = hours.toString().padStart(2, '0')
    const m = minutes.toString().padStart(2, '0')
    const s = seconds.toString().padStart(2, '0')

    if (format === '12h') {
      return showSeconds ? `${h}:${m}:${s} ${period}` : `${h}:${m} ${period}`
    } else {
      return showSeconds ? `${h}:${m}:${s}` : `${h}:${m}`
    }
  }

  const { hours, minutes, seconds, period } = parseTime(field.state.value)

  const get24Hours = (h: number, p: string) => {
    if (format === '12h') {
      if (p === 'AM' && h === 12) return 0
      if (p === 'PM' && h !== 12) return h + 12
    }
    return h
  }

  const get12Hours = (h: number) => {
    if (h === 0) return 12
    if (h > 12) return h - 12
    return h
  }

  const updateTime = (
    newHours: number,
    newMinutes: number,
    newSeconds: number,
    newPeriod?: string,
  ) => {
    const formattedTime = formatTime(
      newHours,
      newMinutes,
      newSeconds,
      newPeriod,
    )
    field.handleChange(formattedTime)
  }

  const displayHours =
    format === '12h' ? get12Hours(get24Hours(hours, period)) : hours
  const maxHours = format === '12h' ? 12 : 23
  const minHours = format === '12h' ? 1 : 0

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor={name} className="px-1">
        {required && <span className="text-red-500 mr-1">*</span>}
        {label}
      </Label>
      <div className="relative">
        <Input
          id={name}
          name={name}
          type="text"
          value={field.state.value}
          placeholder={
            format === '12h'
              ? showSeconds
                ? 'HH:MM:SS AM/PM'
                : 'HH:MM AM/PM'
              : showSeconds
                ? 'HH:MM:SS'
                : 'HH:MM'
          }
          className="bg-background pr-10 cursor-pointer"
          readOnly
          onClick={() => setOpen(true)}
          onBlur={field.handleBlur}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
              tabIndex={-1}
            >
              <CalendarIcon className="size-3.5" />
              <span className="sr-only">Select time</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4" align="start">
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                <Label className="text-xs mb-2">Hours</Label>
                <div className="flex flex-col">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-12"
                    onClick={() => {
                      const newHours =
                        displayHours === maxHours ? minHours : displayHours + 1
                      updateTime(newHours, minutes, seconds, period)
                    }}
                  >
                    ▲
                  </Button>
                  <Input
                    type="number"
                    min={minHours}
                    max={maxHours}
                    value={displayHours}
                    onChange={(e) => {
                      const newHours = Math.max(
                        minHours,
                        Math.min(
                          maxHours,
                          parseInt(e.target.value) || minHours,
                        ),
                      )
                      updateTime(newHours, minutes, seconds, period)
                    }}
                    className="w-16 text-center h-8"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-12"
                    onClick={() => {
                      const newHours =
                        displayHours === minHours ? maxHours : displayHours - 1
                      updateTime(newHours, minutes, seconds, period)
                    }}
                  >
                    ▼
                  </Button>
                </div>
              </div>

              <div className="text-xl font-bold">:</div>

              <div className="flex flex-col items-center">
                <Label className="text-xs mb-2">Minutes</Label>
                <div className="flex flex-col">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-12"
                    onClick={() => {
                      const newMinutes = minutes === 59 ? 0 : minutes + 1
                      updateTime(displayHours, newMinutes, seconds, period)
                    }}
                  >
                    ▲
                  </Button>
                  <Input
                    type="number"
                    min={0}
                    max={59}
                    value={minutes}
                    onChange={(e) => {
                      const newMinutes = Math.max(
                        0,
                        Math.min(59, parseInt(e.target.value) || 0),
                      )
                      updateTime(displayHours, newMinutes, seconds, period)
                    }}
                    className="w-16 text-center h-8"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-12"
                    onClick={() => {
                      const newMinutes = minutes === 0 ? 59 : minutes - 1
                      updateTime(displayHours, newMinutes, seconds, period)
                    }}
                  >
                    ▼
                  </Button>
                </div>
              </div>

              {showSeconds && (
                <>
                  <div className="text-xl font-bold">:</div>
                  <div className="flex flex-col items-center">
                    <Label className="text-xs mb-2">Seconds</Label>
                    <div className="flex flex-col">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-12"
                        onClick={() => {
                          const newSeconds = seconds === 59 ? 0 : seconds + 1
                          updateTime(displayHours, minutes, newSeconds, period)
                        }}
                      >
                        ▲
                      </Button>
                      <Input
                        type="number"
                        min={0}
                        max={59}
                        value={seconds}
                        onChange={(e) => {
                          const newSeconds = Math.max(
                            0,
                            Math.min(59, parseInt(e.target.value) || 0),
                          )
                          updateTime(displayHours, minutes, newSeconds, period)
                        }}
                        className="w-16 text-center h-8"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-12"
                        onClick={() => {
                          const newSeconds = seconds === 0 ? 59 : seconds - 1
                          updateTime(displayHours, minutes, newSeconds, period)
                        }}
                      >
                        ▼
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {format === '12h' && (
                <div className="flex flex-col items-center ml-2">
                  <Label className="text-xs mb-2">Period</Label>
                  <div className="flex flex-col gap-1">
                    <Button
                      type="button"
                      variant={period === 'AM' ? 'default' : 'outline'}
                      size="sm"
                      className="w-12 h-8"
                      onClick={() =>
                        updateTime(displayHours, minutes, seconds, 'AM')
                      }
                    >
                      AM
                    </Button>
                    <Button
                      type="button"
                      variant={period === 'PM' ? 'default' : 'outline'}
                      size="sm"
                      className="w-12 h-8"
                      onClick={() =>
                        updateTime(displayHours, minutes, seconds, 'PM')
                      }
                    >
                      PM
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between mt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const now = new Date()
                  const currentHours =
                    format === '12h'
                      ? get12Hours(now.getHours())
                      : now.getHours()
                  const currentPeriod = now.getHours() >= 12 ? 'PM' : 'AM'
                  updateTime(
                    currentHours,
                    now.getMinutes(),
                    now.getSeconds(),
                    currentPeriod,
                  )
                }}
              >
                Now
              </Button>
              <Button type="button" size="sm" onClick={() => setOpen(false)}>
                Done
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  )
}

export function DateTimePicker({
  label,
  name,
  required = false,
  format = '24h',
  showSeconds = false,
}: {
  label: string
  name: string
  required?: boolean
  format?: '12h' | '24h'
  showSeconds?: boolean
}) {
  const field = useFieldContext<string>()
  const errors = useStore(field.store, (state) => state.meta.errors)
  const [open, setOpen] = useState(false)

  const parseDateTime = (dateTimeString: string) => {
    if (!dateTimeString) {
      const today = new Date()
      return {
        date: today,
        hours: 0,
        minutes: 0,
        seconds: 0,
        period: 'AM',
      }
    }

    // Expected format: "YYYY-MM-DD HH:mm:ss" or "YYYY-MM-DD HH:mm:ss AM/PM"
    const [datePart, timePart, period] = dateTimeString.split(' ')
    const [year, month, day] = datePart.split('-').map(Number)
    const date = new Date(year, month - 1, day)

    const timeParts = timePart.split(':')
    const hours = parseInt(timeParts[0]) || 0
    const minutes = parseInt(timeParts[1]) || 0
    const seconds = parseInt(timeParts[2] || '0') || 0

    return {
      date,
      hours,
      minutes,
      seconds,
      period: period || 'AM',
    }
  }

  const formatDateTime = (
    date: Date,
    hours: number,
    minutes: number,
    seconds: number,
    period?: string,
  ) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const datePart = `${year}-${month}-${day}`

    const h = hours.toString().padStart(2, '0')
    const m = minutes.toString().padStart(2, '0')
    const s = seconds.toString().padStart(2, '0')

    if (format === '12h') {
      const timePart = showSeconds ? `${h}:${m}:${s}` : `${h}:${m}`
      return `${datePart} ${timePart} ${period}`
    } else {
      const timePart = showSeconds ? `${h}:${m}:${s}` : `${h}:${m}`
      return `${datePart} ${timePart}`
    }
  }

  const { date, hours, minutes, seconds, period } = parseDateTime(
    field.state.value,
  )

  const get24Hours = (h: number, p: string) => {
    if (format === '12h') {
      if (p === 'AM' && h === 12) return 0
      if (p === 'PM' && h !== 12) return h + 12
    }
    return h
  }

  const get12Hours = (h: number) => {
    if (h === 0) return 12
    if (h > 12) return h - 12
    return h
  }

  const updateDateTime = (
    newDate: Date,
    newHours: number,
    newMinutes: number,
    newSeconds: number,
    newPeriod?: string,
  ) => {
    const formattedDateTime = formatDateTime(
      newDate,
      newHours,
      newMinutes,
      newSeconds,
      newPeriod,
    )
    field.handleChange(formattedDateTime)
  }

  const displayHours =
    format === '12h' ? get12Hours(get24Hours(hours, period)) : hours
  const maxHours = format === '12h' ? 12 : 23
  const minHours = format === '12h' ? 1 : 0

  const setToday = () => {
    const today = new Date()
    updateDateTime(today, hours, minutes, seconds, period)
  }

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor={name} className="px-1">
        {required && <span className="text-red-500 mr-1">*</span>}
        {label}
      </Label>
      <div className="relative">
        <Input
          id={name}
          name={name}
          type="text"
          value={field.state.value}
          placeholder={
            format === '12h'
              ? showSeconds
                ? 'YYYY-MM-DD HH:MM:SS AM/PM'
                : 'YYYY-MM-DD HH:MM AM/PM'
              : showSeconds
                ? 'YYYY-MM-DD HH:MM:SS'
                : 'YYYY-MM-DD HH:MM'
          }
          className="bg-background pr-10 cursor-pointer"
          readOnly
          onClick={() => setOpen(true)}
          onBlur={field.handleBlur}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
              tabIndex={-1}
            >
              <CalendarIcon className="size-3.5" />
              <span className="sr-only">Select date and time</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4" align="start">
            {/* Date Selection */}
            <div className="mb-4">
              <Label className="text-sm font-medium mb-2 block">Date</Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={date ? date.toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      const [year, month, day] = e.target.value
                        .split('-')
                        .map(Number)
                      const newDate = new Date(year, month - 1, day)
                      updateDateTime(newDate, hours, minutes, seconds, period)
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={setToday}
                  className="px-3"
                >
                  Today
                </Button>
              </div>
            </div>

            {/* Time Selection */}
            <div className="mb-4">
              <Label className="text-sm font-medium mb-2 block">Time</Label>
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-center">
                  <Label className="text-xs mb-2">Hours</Label>
                  <div className="flex flex-col">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-12"
                      onClick={() => {
                        const newHours =
                          displayHours === maxHours
                            ? minHours
                            : displayHours + 1
                        updateDateTime(date, newHours, minutes, seconds, period)
                      }}
                    >
                      ▲
                    </Button>
                    <Input
                      type="number"
                      min={minHours}
                      max={maxHours}
                      value={displayHours}
                      onChange={(e) => {
                        const newHours = Math.max(
                          minHours,
                          Math.min(
                            maxHours,
                            parseInt(e.target.value) || minHours,
                          ),
                        )
                        updateDateTime(date, newHours, minutes, seconds, period)
                      }}
                      className="w-16 text-center h-8"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-12"
                      onClick={() => {
                        const newHours =
                          displayHours === minHours
                            ? maxHours
                            : displayHours - 1
                        updateDateTime(date, newHours, minutes, seconds, period)
                      }}
                    >
                      ▼
                    </Button>
                  </div>
                </div>

                <div className="text-xl font-bold">:</div>

                <div className="flex flex-col items-center">
                  <Label className="text-xs mb-2">Minutes</Label>
                  <div className="flex flex-col">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-12"
                      onClick={() => {
                        const newMinutes = minutes === 59 ? 0 : minutes + 1
                        updateDateTime(
                          date,
                          displayHours,
                          newMinutes,
                          seconds,
                          period,
                        )
                      }}
                    >
                      ▲
                    </Button>
                    <Input
                      type="number"
                      min={0}
                      max={59}
                      value={minutes}
                      onChange={(e) => {
                        const newMinutes = Math.max(
                          0,
                          Math.min(59, parseInt(e.target.value) || 0),
                        )
                        updateDateTime(
                          date,
                          displayHours,
                          newMinutes,
                          seconds,
                          period,
                        )
                      }}
                      className="w-16 text-center h-8"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-12"
                      onClick={() => {
                        const newMinutes = minutes === 0 ? 59 : minutes - 1
                        updateDateTime(
                          date,
                          displayHours,
                          newMinutes,
                          seconds,
                          period,
                        )
                      }}
                    >
                      ▼
                    </Button>
                  </div>
                </div>

                {showSeconds && (
                  <>
                    <div className="text-xl font-bold">:</div>
                    <div className="flex flex-col items-center">
                      <Label className="text-xs mb-2">Seconds</Label>
                      <div className="flex flex-col">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-12"
                          onClick={() => {
                            const newSeconds = seconds === 59 ? 0 : seconds + 1
                            updateDateTime(
                              date,
                              displayHours,
                              minutes,
                              newSeconds,
                              period,
                            )
                          }}
                        >
                          ▲
                        </Button>
                        <Input
                          type="number"
                          min={0}
                          max={59}
                          value={seconds}
                          onChange={(e) => {
                            const newSeconds = Math.max(
                              0,
                              Math.min(59, parseInt(e.target.value) || 0),
                            )
                            updateDateTime(
                              date,
                              displayHours,
                              minutes,
                              newSeconds,
                              period,
                            )
                          }}
                          className="w-16 text-center h-8"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-12"
                          onClick={() => {
                            const newSeconds = seconds === 0 ? 59 : seconds - 1
                            updateDateTime(
                              date,
                              displayHours,
                              minutes,
                              newSeconds,
                              period,
                            )
                          }}
                        >
                          ▼
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                {format === '12h' && (
                  <div className="flex flex-col items-center ml-2">
                    <Label className="text-xs mb-2">Period</Label>
                    <div className="flex flex-col gap-1">
                      <Button
                        type="button"
                        variant={period === 'AM' ? 'default' : 'outline'}
                        size="sm"
                        className="w-12 h-8"
                        onClick={() =>
                          updateDateTime(
                            date,
                            displayHours,
                            minutes,
                            seconds,
                            'AM',
                          )
                        }
                      >
                        AM
                      </Button>
                      <Button
                        type="button"
                        variant={period === 'PM' ? 'default' : 'outline'}
                        size="sm"
                        className="w-12 h-8"
                        onClick={() =>
                          updateDateTime(
                            date,
                            displayHours,
                            minutes,
                            seconds,
                            'PM',
                          )
                        }
                      >
                        PM
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const now = new Date()
                  const currentHours =
                    format === '12h'
                      ? get12Hours(now.getHours())
                      : now.getHours()
                  const currentPeriod = now.getHours() >= 12 ? 'PM' : 'AM'
                  updateDateTime(
                    now,
                    currentHours,
                    now.getMinutes(),
                    now.getSeconds(),
                    currentPeriod,
                  )
                }}
              >
                Now
              </Button>
              <Button type="button" size="sm" onClick={() => setOpen(false)}>
                Done
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  )
}

export function FileInput({
  label,
  name,
  accept,
  multiple = false,
  required = false,
  maxSize,
  placeholder = 'Pilih file atau drag & drop di sini',
}: {
  label: string
  name: string
  accept?: string
  multiple?: boolean
  required?: boolean
  maxSize?: number // in bytes
  placeholder?: string
}) {
  const field = useFieldContext<File | File[] | null>()
  const errors = useStore(field.store, (state) => state.meta.errors)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const validateFileSize = (file: File) => {
    if (maxSize && file.size > maxSize) {
      return `File size must be less than ${formatFileSize(maxSize)}`
    }
    return null
  }

  const handleFileChange = (files: FileList | null) => {
    if (!files || files.length === 0) {
      field.handleChange(multiple ? [] : null)
      return
    }

    const fileArray = Array.from(files)

    // Validate file sizes
    for (const file of fileArray) {
      const sizeError = validateFileSize(file)
      if (sizeError) {
        // You might want to handle this error differently
        console.error(sizeError)
        return
      }
    }

    if (multiple) {
      const currentFiles = (field.state.value as File[]) || []
      field.handleChange([...currentFiles, ...fileArray])
    } else {
      field.handleChange(fileArray[0])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e.target.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFileChange(e.dataTransfer.files)
  }

  const removeFile = (indexToRemove: number) => {
    if (multiple) {
      const currentFiles = (field.state.value as File[]) || []
      const newFiles = currentFiles.filter(
        (_, index) => index !== indexToRemove,
      )
      field.handleChange(newFiles.length > 0 ? newFiles : [])
    } else {
      field.handleChange(null)
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const currentFiles = multiple
    ? (field.state.value as File[]) || []
    : field.state.value
      ? [field.state.value as File]
      : []

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor={name} className="px-1">
        {required && <span className="text-red-500 mr-1">*</span>}
        {label}
        {maxSize && (
          <span className="text-sm text-muted-foreground ml-2">
            (Max: {formatFileSize(maxSize)})
          </span>
        )}
      </Label>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        id={name}
        name={name}
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        onBlur={field.handleBlur}
        required={required}
        className="hidden"
      />

      {/* Drop zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer
          ${
            isDragOver
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }
          ${currentFiles.length > 0 ? 'bg-muted/20' : 'bg-background'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-1">{placeholder}</p>
          <p className="text-xs text-muted-foreground">
            {accept && `Supported formats: ${accept}`}
          </p>
        </div>
      </div>

      {/* Selected files list */}
      {currentFiles.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Selected files:</Label>
          {currentFiles.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between p-3 bg-muted rounded-lg"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile(index)
                }}
                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove file</span>
              </Button>
            </div>
          ))}
        </div>
      )}

      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  )
}
