import { FormSheet } from '@/components/forms/form-sheet'
import {
  MeetingSessionForm,
  type MeetingSessionFormRef,
} from '@/components/forms/meeting-sessions.form'
import {
  UpdateMeetingSessionForm,
  type UpdateMeetingSessionFormRef,
} from '@/components/forms/update-meeting-session-form'
import { Table } from '@/components/table'
import { Button } from '@/components/ui/button'
import {
  cancelMeetingSession,
  completeMeetingSession,
  deleteMeetingSession,
  getMeetingSessions,
} from '@/lib/meeting-sessions'
import type { MeetingSession } from '@/types/response'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Check, Edit2, Loader2, Trash2, X } from 'lucide-react'
import { Fragment, useRef, useState } from 'react'

export const Route = createFileRoute('/_authenticatedLayout/meeting-sessions/')(
  {
    component: RouteComponent,
  },
)

function RouteComponent() {
  const formRef = useRef<MeetingSessionFormRef>(null)
  const updateFormRef = useRef<UpdateMeetingSessionFormRef>(null)

  const { data: meetingSessions, refetch: refetchMeetingSessions } = useQuery<
    MeetingSession[]
  >({
    queryKey: ['meeting-sessions'],
    queryFn: getMeetingSessions,
    select: (sessions) => sessions ?? [],
  })

  const [completedId, setCompletedId] = useState<number | null>(null)
  const { mutate: completeSession, isPending: completingSession } = useMutation(
    {
      mutationFn: completeMeetingSession,
      onMutate: (id: number) => {
        setCompletedId(id)
      },
      onSettled: () => {
        setCompletedId(null)
      },
      onSuccess: async () => {
        await refetchMeetingSessions()
      },
    },
  )

  const [cancelledId, setCancelledId] = useState<number | null>(null)
  const { mutate: cancelSession, isPending: cancellingSession } = useMutation({
    mutationFn: cancelMeetingSession,
    onMutate: (id: number) => {
      setCancelledId(id)
    },
    onSettled: () => {
      setCancelledId(null)
    },
    onSuccess: async () => {
      await refetchMeetingSessions()
    },
  })

  const [deletingId, setDeletingId] = useState<number | null>(null)
  const { mutate: deleteSession, isPending: deletingSession } = useMutation({
    mutationFn: deleteMeetingSession,
    onMutate: (id: number) => {
      setDeletingId(id)
    },
    onSettled: () => {
      setDeletingId(null)
    },
    onSuccess: async () => {
      await refetchMeetingSessions()
    },
  })

  const handleSubmitForm = async () => {
    if (!formRef.current) {
      throw new Error('Form ref is not available')
    }

    try {
      await formRef.current.submit()
    } catch (error) {
      throw error
    }
  }

  const handleUpdateFormSubmit = async () => {
    if (!updateFormRef.current) {
      throw new Error('Update form ref is not available')
    }

    try {
      await updateFormRef.current.submit()
    } catch (error) {
      throw error
    }
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
              <Fragment>
                <Button
                  variant="success"
                  size="icon"
                  onClick={() => completeSession(info.row.original.id)}
                  disabled={
                    (completingSession &&
                      info.row.original.id === completedId) ||
                    info.row.original.session_status == 'completed' ||
                    info.row.original.session_status == 'cancelled'
                  }
                  className="mr-2"
                  aria-label="Selesaikan Sesi Pertemuan"
                >
                  {completingSession && info.row.original.id === completedId ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  disabled={
                    (cancellingSession &&
                      info.row.original.id === cancelledId) ||
                    info.row.original.session_status == 'completed' ||
                    info.row.original.session_status == 'cancelled'
                  }
                  className="mr-2"
                  aria-label="Batalkan Sesi Pertemuan"
                  onClick={() => cancelSession(info.row.original.id)}
                >
                  {cancellingSession && info.row.original.id === cancelledId ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </Button>
                <FormSheet
                  trigger={
                    <Button variant="warning" size="icon">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  }
                  title="Perbarui Sesi Pertemuan"
                  description="Tindakan ini akan memperbarui sesi pertemuan yang dipilih. Silakan isi formulir di bawah ini untuk melanjutkan."
                  onSubmitForm={handleUpdateFormSubmit}
                  disabled={false}
                >
                  <UpdateMeetingSessionForm
                    session={info.row.original}
                    ref={updateFormRef}
                  />
                </FormSheet>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => deleteSession(info.row.original.id)}
                  disabled={
                    deletingSession && info.row.original.id === deletingId
                  }
                  className="ml-2"
                  aria-label="Hapus Sesi Pertemuan"
                >
                  {deletingSession && info.row.original.id === deletingId ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </Fragment>
            ),
          },
        ]}
        data={meetingSessions || []}
      />
    </div>
  )
}
