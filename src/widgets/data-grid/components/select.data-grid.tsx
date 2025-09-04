import { useMemo } from 'react'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/shared/ui/select'
import type { RenderEditCellProps } from 'react-data-grid'
import type { SelectOption } from '../types'

export default function SelectEditor<TRow, TSummaryRow>({
  row,
  column,
  options,
  onRowChange,
  onClose,
}: RenderEditCellProps<TRow, TSummaryRow> & { options: Array<SelectOption> }) {
  const currentValue = useMemo(() => {
    return (row[column.key as keyof TRow] as unknown as string) || ''
  }, [row, column.key])

  const selectedOption = useMemo(() => {
    return options.find((option) => option.value === currentValue)
  }, [options, currentValue])

  const handleCellValueChange = (value: string) => {
    onRowChange({ ...row, [column.key]: value }, true)
    onClose(true, false)
  }

  return (
    <Select
      defaultOpen
      onValueChange={handleCellValueChange}
      onOpenChange={(isOpen) => !isOpen && onClose(true, false)}
      value={currentValue}
    >
      <SelectTrigger className="w-full h-full border-none bg-transparent hover:bg-transparent focus:ring-0 focus:ring-offset-0">
        <SelectValue placeholder="Select...">
          {selectedOption?.label}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="min-w-[200px]">
        {options.map((option) => (
          <SelectItem
            key={option.value as string}
            value={option.value as string}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
