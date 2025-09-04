import { getMeetingSessionByUser } from '@/entities/meeting-sessions'
import { MeetingDataSkeleton } from '@/features/meeting-sessions/widgets/meeting-data-skeleton'
import { MeetingSessionsDataGrid } from '@/features/meeting-sessions/widgets/meeting-sessions.data-grid'
import type { MeetingSession } from '@/shared/types/response'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useParams } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticatedLayout/meeting-sessions/$user',
)({
  component: RouteComponent,
})

interface StudentMeetingSessions {
  total_sessions: number
  student_id: number
  sessions: MeetingSession[]
}

function RouteComponent() {
  const { user } = useParams({
    from: '/_authenticatedLayout/meeting-sessions/$user',
  })

  const { data, isLoading } = useQuery<StudentMeetingSessions>({
    queryKey: ['meeting-session', user],
    queryFn: () => getMeetingSessionByUser(user),
    select: (data) => ({
      ...data,
      sessions: data.sessions.concat(
        Array.from(
          { length: data.total_sessions - data.sessions.length },
          () => ({}) as MeetingSession,
        ),
      ),
    }),
  })

  return (
    <div>
      {isLoading && <MeetingDataSkeleton />}
      {!isLoading && (
        <MeetingSessionsDataGrid
          data={data?.sessions ?? []}
          studentId={data?.student_id}
        />
      )}
    </div>
  )
}
