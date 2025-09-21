import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import type { MeetingSession } from '@/shared/types/response'
import { useHeaderStore } from '@/shared/hooks/use-header'

import { getMeetingSessions } from '@/entities/meeting-sessions'

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
  const { data, isLoading } = useQuery<Array<MeetingSession>>({
    queryKey: ['meeting-sessions'],
    queryFn: getMeetingSessions,
    select: (datas) => {
      const emptyRows = Array.from({length: datas.length + 10}).map((_) => ({
        mentor_id: undefined,
        student_id: undefined,
        session_date: undefined,
        session_time: undefined,
        duration: undefined,
        note: undefined,
        description: undefined,
        created_at: new Date(),
        updated_at: new Date(),
        student: null,
        mentor: null,
        status: undefined,
      })) as unknown as Array<MeetingSession>

      return [...datas, ...emptyRows]
    },
  })

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-medium">List Pertemuan</h1>
          <p className="text-sm text-gray-500">
            Daftar sesi pertemuan yang telah dijadwalkan
          </p>
        </div>
      </div>

      <div className="w-full">
        {isLoading && <MeetingDataSkeleton />}
        {!isLoading && <MeetingSessionsDataGrid data={data ?? []} />}
      </div>
    </div>
  )
}
