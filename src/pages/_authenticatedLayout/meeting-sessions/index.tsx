import { useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { useHeaderStore } from '@/shared/hooks/use-header'
import { Button } from '@/shared/ui/button'
import { FormSheet } from '@/shared/ui/form-sheet'

import { getMeetingSessions } from '@/entities/meeting-sessions'
import type { MeetingSession } from '@/shared/types/response'

import {
  MeetingSessionForm,
  type MeetingSessionFormRef,
} from '@/features/meeting-sessions/widgets/meeting-sessions.form'
import { MeetingDataSkeleton } from '@/features/meeting-sessions/widgets/meeting-data-skeleton'
import { MeetingSessionsDataGrid } from '@/features/meeting-sessions/widgets/meeting-sessions.data-grid'

export const Route = createFileRoute('/_authenticatedLayout/meeting-sessions/')(
  {
    loader: () => {
      const setTitle = useHeaderStore.getState().setTitle
      setTitle('Sesi Pertemuan')
    },
    component: RouteComponent,
  },
)

function RouteComponent() {
  const formRef = useRef<MeetingSessionFormRef>(null)

  const {
    data: meetingSessions,
    refetch: refetchMeetingSessions,
    isLoading,
  } = useQuery<MeetingSession[]>({
    queryKey: ['meeting-sessions'],
    queryFn: getMeetingSessions,
    select: (sessions) => sessions ?? [],
  })

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <FormSheet
          trigger={<Button>Tambah Sesi Pertemuan</Button>}
          title="Buat Sesi Pertemuan Baru"
          description="Tindakan ini akan membuat sesi pertemuan baru. Silakan isi formulir di bawah ini untuk melanjutkan."
          onSubmitForm={() => {}}
          disabled={false}
        >
          <MeetingSessionForm
            ref={formRef}
            onSuccess={async () => {
              await refetchMeetingSessions()
            }}
          />
        </FormSheet>
      </div>

      <div className="w-full">
        {isLoading && <MeetingDataSkeleton />}
        {!isLoading && <MeetingSessionsDataGrid data={meetingSessions ?? []} />}
      </div>
    </div>
  )
}
