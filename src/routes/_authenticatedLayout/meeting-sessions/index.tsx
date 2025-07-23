import { FormSheet } from '@/components/forms/form-sheet'
import {
  MeetingSessionForm,
  type MeetingSessionFormRef,
} from '@/components/forms/meeting-sessions.form'
import { Table } from '@/components/table'
import { Button } from '@/components/ui/button'
import { getMeetingSessions } from '@/lib/meeting-sessions'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useRef } from 'react'

export const Route = createFileRoute('/_authenticatedLayout/meeting-sessions/')(
  {
    component: RouteComponent,
  },
)

function RouteComponent() {
  const formRef = useRef<MeetingSessionFormRef>(null)

  const { data: meetingSessions } = useQuery({
    queryKey: ['meeting-sessions'],
    queryFn: getMeetingSessions,
    select: (data) => data.data.sessions ?? [],
  })

  const handleSubmitForm = () => {
    formRef.current?.submit()
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium">List Sesi Pertemuan</h1>
        <FormSheet
          trigger={<Button>Tambah Sesi Pertemuan</Button>}
          title="Buat Sesi Pertemuan Baru"
          description="Tindakan ini akan membuat sesi pertemuan baru. Silakan isi formulir di bawah ini untuk melanjutkan."
          onSubmitForm={handleSubmitForm}
          disabled={false}
        >
          <MeetingSessionForm ref={formRef} />
        </FormSheet>
      </div>

      <Table
        key={`table-meeting-sessions`}
        columns={[
          {
            accessorKey: 'session_date',
            header: 'Tanggal Sesi',
            cell: (info) => new Date(info.getValue()).toLocaleDateString(),
          },
          {
            accessorKey: 'student.name',
            header: 'Nama Murid',
          },
          {
            accessorKey: 'mentor.name',
            header: 'Nama Mentor',
          },
          {
            accessorKey: 'session_time',
            header: 'Waktu Sesi',
            cell: (info) => new Date(info.getValue()).toLocaleTimeString(),
          },
          {
            accessorKey: 'session_topic',
            header: 'Topik',
          },
          {
            accessorKey: 'session_duration',
            header: 'Durasi',
            cell: (info) => `${info.getValue()} menit`,
          },
          {
            header: 'Aksi',
            cell: (info) => (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Handle action button click
                  console.log('Action clicked for session:', info.row.original)
                }}
              >
                Aksi
              </Button>
            ),
          },
        ]}
        data={meetingSessions || []}
      />
    </div>
  )
}
