import type { ChangeEventHandler, FocusEventHandler } from 'react'
import type { RenderEditCellProps } from 'react-data-grid'

const autoFocusAndSelect = (input: HTMLInputElement | null) => {
  input?.focus()
  input?.select()
}

export default function TextEditor<TRow, TSummaryRow>({
  row,
  column,
  onRowChange,
  onClose,
}: RenderEditCellProps<TRow, TSummaryRow>) {
  const handleCellChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    onRowChange({ ...row, [column.key]: event.target.value })
  }

  const handleCellBlur: FocusEventHandler<HTMLInputElement> = () => {
    onClose(true, false)
  }

  return (
    <input
      className="rdg-text-editor appearance-none box-border w-full h-full px-1.5 border-2 border-[#ccc] align-top text-[var(--rdg-color)] bg-[var(--rdg-background-color)] font-inherit focus:border-[var(--rdg-selection-color)] focus:outline-none placeholder:text-[#999] placeholder:opacity-100"
      ref={autoFocusAndSelect}
      value={row[column.key as keyof TRow] as unknown as string}
      onChange={handleCellChange}
      onBlur={handleCellBlur}
    />
  )
}
