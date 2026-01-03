import { useState, useMemo } from 'react'
import type { KeyboardEvent } from 'react'
import type { RenderEditCellProps } from 'react-data-grid'
import { format } from 'date-fns'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { Button } from '@/shared/ui/button'
import { Calendar } from '@/shared/ui/calendar'
import { CalendarIcon } from 'lucide-react'

export default function DateEditor<TRow, TSummaryRow>({
  row,
  column,
  onRowChange,
  onClose,
}: RenderEditCellProps<TRow, TSummaryRow>) {
  const [open, setOpen] = useState(true)

  const currentValue = useMemo(() => {
    return (row[column.key as keyof TRow] as unknown as string) || ''
  }, [row, column.key])

  const parseDate = (dateString: string): Date | undefined => {
    if (!dateString) return undefined
    const [year, month, day] = dateString.split('-').map(Number)
    if (isNaN(year) || isNaN(month) || isNaN(day)) return undefined
    return new Date(year, month - 1, day)
  }

  const formatDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const selectedDate = parseDate(currentValue)
  const [month, setMonth] = useState<Date | undefined>(selectedDate ?? new Date())

  const handleSelectDate = (date: Date | undefined) => {
    if (date) {
      const formatted = formatDate(date)
      onRowChange({ ...row, [column.key]: formatted }, true)
      setOpen(false)
      onClose(true, false)
    }
  }

  const handleSetToday = () => {
    handleSelectDate(new Date())
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
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

  const displayDate = selectedDate
    ? format(selectedDate, 'dd MMM yyyy')
    : 'Select date...'

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <div className="w-full h-full flex items-center gap-2 px-2 cursor-pointer bg-[var(--rdg-background-color)] text-[var(--rdg-color)]">
          <CalendarIcon className="size-3.5 opacity-50" />
          {displayDate}
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align="start"
        sideOffset={2}
        onKeyDown={handleKeyDown}
      >
        <div className="space-y-2">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelectDate}
            month={month}
            onMonthChange={setMonth}
            captionLayout="dropdown"
            initialFocus
          />
          <div className="flex justify-between px-3 pb-3 border-t pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSetToday}
            >
              Today
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setOpen(false)
                onClose(false, false)
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
