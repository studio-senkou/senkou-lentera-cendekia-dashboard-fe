import { useState, useMemo, useEffect, useRef } from 'react'
import type { KeyboardEvent } from 'react'
import type { RenderEditCellProps } from 'react-data-grid'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'

const DURATION_PRESETS = [
  { label: '30m', value: 30 },
  { label: '45m', value: 45 },
  { label: '1h', value: 60 },
  { label: '1.5h', value: 90 },
  { label: '2h', value: 120 },
] as const

export default function DurationEditor<TRow, TSummaryRow>({
  row,
  column,
  onRowChange,
  onClose,
}: RenderEditCellProps<TRow, TSummaryRow>) {
  const [open, setOpen] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  const currentValue = useMemo(() => {
    const val = row[column.key as keyof TRow] as unknown as string | number
    return val ? Number(val) : 0
  }, [row, column.key])

  const [customValue, setCustomValue] = useState(String(currentValue || ''))

  const handleSelectPreset = (value: number) => {
    onRowChange({ ...row, [column.key]: value }, true)
    setOpen(false)
    onClose(true, false)
  }

  const handleCustomChange = (value: string) => {
    setCustomValue(value)
    const numValue = parseInt(value)
    if (!isNaN(numValue) && numValue > 0) {
      onRowChange({ ...row, [column.key]: numValue })
    }
  }

  const handleConfirm = () => {
    const numValue = parseInt(customValue)
    if (!isNaN(numValue) && numValue > 0) {
      onRowChange({ ...row, [column.key]: numValue }, true)
    }
    setOpen(false)
    onClose(true, false)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
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
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <div className="w-full h-full flex items-center px-2 cursor-pointer bg-[var(--rdg-background-color)] text-[var(--rdg-color)]">
          {currentValue ? formatDuration(currentValue) : 'Select duration...'}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start" sideOffset={2}>
        <div className="space-y-3">
          <div className="text-sm font-medium text-muted-foreground">
            Quick Select
          </div>
          <div className="grid grid-cols-5 gap-1">
            {DURATION_PRESETS.map((preset) => (
              <Button
                key={preset.value}
                type="button"
                variant={currentValue === preset.value ? 'default' : 'outline'}
                size="sm"
                className="h-8 text-xs"
                onClick={() => handleSelectPreset(preset.value)}
              >
                {preset.label}
              </Button>
            ))}
          </div>

          <div className="border-t pt-3">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Custom (minutes)
            </div>
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                type="number"
                min={1}
                placeholder="e.g. 75"
                value={customValue}
                onChange={(e) => handleCustomChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-8"
              />
              <Button
                type="button"
                size="sm"
                className="h-8"
                onClick={handleConfirm}
              >
                Set
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
