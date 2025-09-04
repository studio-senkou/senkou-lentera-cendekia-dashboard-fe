import type { MeetingSession } from '@/shared/types/response'
import { useEditor } from '@/widgets/data-grid/hooks/use-editor'
import { DataGrid } from '@/widgets/data-grid'
import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { useQuery } from '@tanstack/react-query'
import { getMentorDropdown } from '@/entities/users'
import type { ColumnOrColumnGroup } from 'react-data-grid'
import type { DataGridChangedRow } from '@/widgets/data-grid/types'
import { Button } from '@/shared/ui/button'
import { Cloud } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { toast } from 'sonner'
import {
  bulkCreateMeetingSessions,
  bulkUpdateMeetingSessions,
} from '@/entities/meeting-sessions'

export interface MeetingSessionDataGridProps {
  data: Array<MeetingSession>
  studentId?: number
}

export function MeetingSessionsDataGrid({
  data,
  studentId,
}: MeetingSessionDataGridProps) {
  const { editor } = useEditor<MeetingSession>()
  const [unsyncedChanges, setUnsyncedChanges] = useState<Array<MeetingSession>>(
    [],
  )

  const { data: mentorOptions } = useQuery({
    queryKey: ['mentors', 'dropdown'],
    queryFn: () => getMentorDropdown(),
    select: (mentors) =>
      mentors.map((mentor) => ({
        value: mentor.id,
        label: mentor.name,
      })),
  })

  const handleRowsChange = async (
    rows: MeetingSession[],
    _: Array<DataGridChangedRow<MeetingSession>>,
  ) => {
    setUnsyncedChanges(rows)
  }

  const handleSyncData = async () => {
    try {
      const updatedData = unsyncedChanges
        .filter((row) => row.id)
        .map((row) => ({
          session_id: row.id,
          date: row.session_date,
          time: row.session_time,
          ...row,
        }))

      const newData = unsyncedChanges
        .filter((row) => !row.id)
        .map((row) => ({
          student_id: studentId!,
          mentor_id: Number(row.mentor_id),
          date: row.session_date,
          time: row.session_time,
          duration: Number(row.duration),
          description: row.description,
          note: row.note ?? undefined,
        }))

      if (updatedData.length > 0) {
        await bulkUpdateMeetingSessions({
          sessions: updatedData,
        })
      }

      if (newData.length > 0) {
        await bulkCreateMeetingSessions({ data: newData })
      }
    } catch (error) {
      toast.error('Gagal menyimpan perubahan. Silakan coba lagi.')
    }
  }

  const columns = useMemo(() => {
    return [
      {
        key: 'mentor_id',
        name: 'Nama Mentor',
        renderEditCell: (props) =>
          editor.renderSelectEditor(props, {
            options:
              mentorOptions?.filter(
                (option) => String(option.value) !== props.row.mentor_id,
              ) ?? [],
          }),
        renderCell: ({ row }) => {
          const mentor = mentorOptions?.find((option) => {
            return String(option.value) === String(row.mentor_id)
          })

          return (
            <div className="min-w-[200px]">{mentor ? mentor.label : ''}</div>
          )
        },
      },
      {
        key: 'description',
        name: 'Deskripsi',
        renderEditCell: editor.renderTextEditor,
        renderCell: ({ row }) => (
          <div className="min-w-[300px] max-w-none whitespace-normal break-words leading-relaxed py-2">
            {row.description}
          </div>
        ),
      },
      {
        key: 'session_date',
        name: 'Tanggal Sesi',
        renderEditCell: editor.renderDateEditor,
        renderCell: ({ row }) => (
          <span>
            {row?.session_date ? format(row.session_date, 'dd MMMM yyyy') : ''}
          </span>
        ),
      },
      {
        key: 'session_time',
        name: 'Waktu Sesi',
        renderEditCell: editor.renderTimeEditor,
        renderCell: ({ row }) => (
          <span>{row?.session_time ? row.session_time.slice(0, 5) : ''}</span>
        ),
      },
      {
        key: 'duration',
        name: 'Durasi Sesi',
        renderEditCell: editor.renderNumberEditor,
      },
      {
        key: 'note',
        name: 'Catatan',
        renderEditCell: editor.renderTextEditor,
        renderCell: ({ row }) => (
          <div className="min-w-[300px] max-w-none whitespace-normal break-words leading-relaxed py-2">
            {row?.note}
          </div>
        ),
      },
    ] as ColumnOrColumnGroup<NoInfer<MeetingSession>>[]
  }, [editor, mentorOptions])

  return (
    <div className="flex flex-col justify-center items-end gap-2">
      <Tooltip>
        <TooltipTrigger>
          <Button onClick={handleSyncData}>
            <Cloud />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Sync Data</p>
        </TooltipContent>
      </Tooltip>
      <DataGrid<MeetingSession>
        rows={data}
        columns={columns}
        enableVirtualization
        enableVariableRowHeight
        estimatedRowHeight={80}
        onRowsDataChange={handleRowsChange}
      />
    </div>
  )
}
