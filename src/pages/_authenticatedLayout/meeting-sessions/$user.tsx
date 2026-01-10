import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useParams } from '@tanstack/react-router'
import { Calendar } from 'lucide-react'
import type { MeetingSession } from '@/shared/types/response'
import { getMeetingSessionByUser } from '@/entities/meeting-sessions'
import { getUserById } from '@/entities/users'
import { MeetingDataSkeleton } from '@/features/meeting-sessions/widgets/meeting-data-skeleton'
import { MeetingSessionsDataGrid } from '@/features/meeting-sessions/widgets/meeting-sessions.data-grid'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'

export const Route = createFileRoute(
  '/_authenticatedLayout/meeting-sessions/$user',
)({
  component: RouteComponent,
})

interface StudentMeetingSessions {
  total_sessions: number
  student_id: number
  sessions: Array<MeetingSession>
}

function RouteComponent() {
  const { user } = useParams({
    from: '/_authenticatedLayout/meeting-sessions/$user',
  })

  const { data, isLoading } = useQuery<StudentMeetingSessions>({
    queryKey: ['meeting-session', user],
    queryFn: () => getMeetingSessionByUser(user),
    select: (datas) => ({
      ...datas,
      sessions: datas.sessions.concat(
        Array.from(
          { length: ((datas.total_sessions) - datas.sessions.length) + 10 },
          () => ({}) as MeetingSession,
        ),
      ),
    }),
  })

  const { data: currentUser } = useQuery({
    queryKey: ['user', user],
    queryFn: () => getUserById(user),
  })

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-4">
      {/* User Details Header */}
      {currentUser && (
        <div className="rounded-lg border bg-card text-card-foreground">
          <div className="flex items-center gap-4 p-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {getInitials(currentUser.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                {currentUser.name}
              </h2>
              <p className="text-muted-foreground">{currentUser.email}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Total Sesi</span>
              </div>
              <p className="text-2xl font-bold text-primary">
                {data?.total_sessions ?? 0}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Data Grid */}
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
