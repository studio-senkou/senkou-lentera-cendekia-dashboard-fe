import { useMemo, useState } from 'react'
import type {
  ChangeEventHandler,
  FocusEventHandler,
  KeyboardEvent,
} from 'react'
import type { RenderEditCellProps } from 'react-data-grid'

export default function TimeEditor<TRow, TSummaryRow>({
  row,
  column,
  onRowChange,
  onClose,
}: RenderEditCellProps<TRow, TSummaryRow>) {
  const currentValue = useMemo(() => {
    return (row[column.key as keyof TRow] as unknown as string) || ''
  }, [row, column.key])

  const [value, setValue] = useState(currentValue)

  const handleCellChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const newValue = event.target.value
    setValue(newValue)
    onRowChange({ ...row, [column.key]: newValue })
  }

  const handleCellBlur: FocusEventHandler<HTMLInputElement> = () => {
    onRowChange({ ...row, [column.key]: value })
    onClose(true, false)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onRowChange({ ...row, [column.key]: value })
      onClose(true, false)
    } else if (event.key === 'Escape') {
      setValue(currentValue)
      onClose(false, false)
    }
  }

  return (
    <input
      type="time"
      className="rdg-text-editor appearance-none box-border w-full h-full px-1.5 border-2 border-[#ccc] align-top text-[var(--rdg-color)] bg-[var(--rdg-background-color)] font-inherit focus:border-[var(--rdg-selection-color)] focus:outline-none placeholder:text-[#999] placeholder:opacity-100"
      value={value}
      onChange={handleCellChange}
      onBlur={handleCellBlur}
      onKeyDown={handleKeyDown}
      autoFocus
    />
  )
}
