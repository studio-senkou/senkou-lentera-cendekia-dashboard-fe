import { useState, useMemo, useEffect, useRef } from 'react'
import type { KeyboardEvent } from 'react'
import type { RenderEditCellProps } from 'react-data-grid'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Clock } from 'lucide-react'

const TIME_PRESETS = [
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
] as const

export default function TimeEditor<TRow, TSummaryRow>({
  row,
  column,
  onRowChange,
  onClose,
}: RenderEditCellProps<TRow, TSummaryRow>) {
  const [open, setOpen] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  const currentValue = useMemo(() => {
    const val = row[column.key as keyof TRow] as unknown as string
    return val || ''
  }, [row, column.key])

  const parseTime = (timeString: string) => {
    if (!timeString) return { hours: 9, minutes: 0 }
    const [h, m] = timeString.split(':').map(Number)
    return { hours: isNaN(h) ? 9 : h, minutes: isNaN(m) ? 0 : m }
  }

  const { hours, minutes } = parseTime(currentValue)
  const [selectedHours, setSelectedHours] = useState(hours)
  const [selectedMinutes, setSelectedMinutes] = useState(minutes)

  const formatTime = (h: number, m: number) => {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }

  const updateTime = (h: number, m: number, commit = false) => {
    setSelectedHours(h)
    setSelectedMinutes(m)
    const formatted = formatTime(h, m)
    onRowChange({ ...row, [column.key]: formatted }, commit)
  }

  const handleSelectPreset = (time: string) => {
    const { hours: h, minutes: m } = parseTime(time)
    updateTime(h, m, true)
    setOpen(false)
    onClose(true, false)
  }

  const handleConfirm = () => {
    const formatted = formatTime(selectedHours, selectedMinutes)
    onRowChange({ ...row, [column.key]: formatted }, true)
    setOpen(false)
    onClose(true, false)
  }

  const handleSetNow = () => {
    const now = new Date()
    updateTime(now.getHours(), now.getMinutes(), true)
    setOpen(false)
    onClose(true, false)
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleConfirm()
    } else if (event.key === 'Escape') {
      setOpen(false)
      onClose(false, false)
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      onClose(true, false)
    }
  }

  useEffect(() => {
    if (open && containerRef.current) {
      containerRef.current.focus()
    }
  }, [open])

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <div className="w-full h-full flex items-center gap-2 px-2 cursor-pointer bg-[var(--rdg-background-color)] text-[var(--rdg-color)]">
          <Clock className="size-3.5 opacity-50" />
          {currentValue ? currentValue.slice(0, 5) : 'Select time...'}
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-72 p-4"
        align="start"
        sideOffset={2}
        onKeyDown={handleKeyDown}
      >
        <div ref={containerRef} className="space-y-4" tabIndex={0}>
          {/* Time Spinner */}
          <div className="flex items-center justify-center gap-2">
            <div className="flex flex-col items-center">
              <Label className="text-xs mb-2 text-muted-foreground">Hour</Label>
              <div className="flex flex-col items-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-14"
                  onClick={() =>
                    updateTime(selectedHours >= 23 ? 0 : selectedHours + 1, selectedMinutes)
                  }
                >
                  ▲
                </Button>
                <Input
                  type="number"
                  min={0}
                  max={23}
                  value={selectedHours}
                  onChange={(e) => {
                    const h = Math.max(0, Math.min(23, parseInt(e.target.value) || 0))
                    updateTime(h, selectedMinutes)
                  }}
                  className="w-14 text-center h-9 text-lg font-medium"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-14"
                  onClick={() =>
                    updateTime(selectedHours <= 0 ? 23 : selectedHours - 1, selectedMinutes)
                  }
                >
                  ▼
                </Button>
              </div>
            </div>

            <div className="text-2xl font-bold text-muted-foreground pt-6">:</div>

            <div className="flex flex-col items-center">
              <Label className="text-xs mb-2 text-muted-foreground">Minute</Label>
              <div className="flex flex-col items-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-14"
                  onClick={() =>
                    updateTime(selectedHours, selectedMinutes >= 59 ? 0 : selectedMinutes + 1)
                  }
                >
                  ▲
                </Button>
                <Input
                  type="number"
                  min={0}
                  max={59}
                  value={selectedMinutes}
                  onChange={(e) => {
                    const m = Math.max(0, Math.min(59, parseInt(e.target.value) || 0))
                    updateTime(selectedHours, m)
                  }}
                  className="w-14 text-center h-9 text-lg font-medium"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-14"
                  onClick={() =>
                    updateTime(selectedHours, selectedMinutes <= 0 ? 59 : selectedMinutes - 1)
                  }
                >
                  ▼
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="border-t pt-3">
            <div className="text-xs font-medium text-muted-foreground mb-2">
              Quick Select
            </div>
            <div className="grid grid-cols-4 gap-1">
              {TIME_PRESETS.map((time) => (
                <Button
                  key={time}
                  type="button"
                  variant={currentValue.startsWith(time) ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => handleSelectPreset(time)}
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between border-t pt-3">
            <Button type="button" variant="outline" size="sm" onClick={handleSetNow}>
              Now
            </Button>
            <Button type="button" size="sm" onClick={handleConfirm}>
              Confirm
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
