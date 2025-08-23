import { StatCard } from '@/components/stat-card'
import { Table } from '@/components/table'
import { useHeaderStore } from '@/integrations/zustand/hooks/use-header'
import { getMeetingSessions } from '@/lib/meeting-sessions'
import { getUserCount } from '@/lib/users'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import { ExternalLink } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/_authenticatedLayout/')({
  loader: () => {
    const setTitle = useHeaderStore.getState().setTitle
    setTitle('Dashboard')
  },
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()

  const [dateFilter] = useState(() => {
    const startDate = format(
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      'yyyy-MM-dd',
    )
    const endDate = format(new Date(), 'yyyy-MM-dd')

    return startDate + '|' + endDate
  })

  const { data: meetingSessions, isLoading } = useQuery({
    queryKey: ['meeting-sessions', 'dashboard', dateFilter],
    queryFn: () => getMeetingSessions({ date: dateFilter }),
  })

  const { data: userCount, isLoading: loadingUsers } = useQuery({
    queryKey: ['users', 'count', 'dashboard'],
    queryFn: getUserCount,
    staleTime: 1000 * 60 * 5,
  })

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <StatCard
          title="Total Murid"
          value={userCount?.student ?? 0}
          loading={loadingUsers}
          variant="solid"
          note="Increased from last month"
          onClick={() => navigate({ to: '/users' })}
        />
        <StatCard
          title="Total Mentor"
          value={userCount?.mentor ?? 0}
          loading={loadingUsers}
          variant="plain"
          note="Increased from last month"
          onClick={() => navigate({ to: '/users' })}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex flex-col mb-3">
              <h1 className="text-xl font-medium">Sesi Meeting</h1>
              <p className="text-sm text-gray-500">
                Daftar sesi meeting yang dijadwalkan
              </p>
            </div>

            <div
              className="border boder-gray-200/50 p-3 rounded-full hover:bg-gray-200 cursor-pointer transition-colors duration-300"
              onClick={() => navigate({ to: '/meeting-sessions' })}
            >
              <ExternalLink className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-gray-200/50 p-2 lg:p-5 rounded-lg">
            <div className="bg-white rounded-lg">
              <Table
                key="table-meeting-sessions-dashboard"
                columns={[
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
                    header: 'Waktu',
                  },
                  {
                    accessorKey: 'session_date',
                    header: 'Tanggal',
                    cell: ({ cell }) => {
                      return format(
                        new Date(cell.getValue<string>()),
                        'dd MMMM yyyy',
                      )
                    },
                  },
                ]}
                data={meetingSessions ?? []}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
