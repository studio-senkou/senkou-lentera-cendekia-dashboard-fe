import { ListFilter } from 'lucide-react'

import { countActiveMeetingSessionFilters } from './meeting-session-filters'
import type { MeetingSessionFilters } from './meeting-session-filters'

import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'

interface FilterField {
  key: keyof MeetingSessionFilters
  label: string
  type?: 'text' | 'date' | 'time' | 'number'
  placeholder?: string
}

const FILTER_FIELDS: Array<FilterField> = [
  { key: 'student', label: 'Nama Siswa', placeholder: 'Cari nama siswa…' },
  { key: 'mentor', label: 'Nama Mentor', placeholder: 'Cari nama mentor…' },
  {
    key: 'subject',
    label: 'Mata Pelajaran',
    placeholder: 'Cari mata pelajaran…',
  },
  { key: 'description', label: 'Deskripsi', placeholder: 'Cari deskripsi…' },
  { key: 'date', label: 'Tanggal Sesi', type: 'date' },
  { key: 'time', label: 'Waktu Sesi', type: 'time' },
  {
    key: 'duration',
    label: 'Durasi Sesi (menit)',
    type: 'number',
    placeholder: 'Misal 60',
  },
  { key: 'note', label: 'Catatan', placeholder: 'Cari catatan…' },
]

interface MeetingSessionFilterPopoverProps {
  filters: MeetingSessionFilters
  onChange: (filters: MeetingSessionFilters) => void
  onReset: () => void
}

export function MeetingSessionFilterPopover({
  filters,
  onChange,
  onReset,
}: MeetingSessionFilterPopoverProps) {
  const activeCount = countActiveMeetingSessionFilters(filters)

  const handleFieldChange = (
    key: keyof MeetingSessionFilters,
    value: string,
  ) => {
    onChange({ ...filters, [key]: value })
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <ListFilter className="h-4 w-4" />
          Filter
          {activeCount > 0 && (
            <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
              {activeCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        collisionPadding={8}
        className="flex max-h-[var(--radix-popover-content-available-height,calc(100dvh-2rem))] w-80 max-w-[calc(100vw-2rem)] flex-col overflow-hidden p-0"
      >
        <div className="flex shrink-0 items-center justify-end border-b px-4 py-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onReset}
            disabled={activeCount === 0}
          >
            Reset
          </Button>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
          {FILTER_FIELDS.map((field) => (
            <div key={field.key} className="grid gap-1.5">
              <Label htmlFor={`meeting-filter-${field.key}`}>
                {field.label}
              </Label>
              <Input
                id={`meeting-filter-${field.key}`}
                type={field.type ?? 'text'}
                value={filters[field.key]}
                placeholder={field.placeholder}
                onChange={(event) =>
                  handleFieldChange(field.key, event.target.value)
                }
              />
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
