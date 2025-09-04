import { useStore } from '@tanstack/react-form'
import { useFieldContext } from '../hooks/form-context'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
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
