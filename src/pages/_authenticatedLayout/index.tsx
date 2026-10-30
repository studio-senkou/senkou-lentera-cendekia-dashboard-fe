import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import { ExternalLink } from 'lucide-react'
import { useState } from 'react'
import BasePageLayout from '@/widgets/base-page-layout'
import { StatCard } from '@/widgets/stat-card'
import { Table } from '@/widgets/table'
import { useHeaderStore } from '@/shared/hooks/use-header'
import { useServerTable } from '@/shared/hooks/use-server-table'
import { Button } from '@/shared/ui/button'
import { getPaginatedMeetingSessions } from '@/entities/meeting-sessions'
import { getUserCount } from '@/entities/users'

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

  const {
    pagination,
    params,
    search,
    searchInput,
    setSearchInput,
    setPage,
    setPageSize,
  } = useServerTable()

  const { data, isLoading } = useQuery({
    queryKey: [
      'meeting-sessions',
      'dashboard',
      dateFilter,
      pagination.currentPage,
      pagination.pageSize,
      search,
    ],
    queryFn: () => getPaginatedMeetingSessions({ ...params, date: dateFilter }),
  })

  const meetingSessions = data?.sessions ?? []

  const { data: userCount, isLoading: loadingUsers } = useQuery({
    queryKey: ['users', 'count', 'dashboard'],
    queryFn: getUserCount,
    staleTime: 1000 * 60 * 5,
  })

  return (
    <BasePageLayout subtitle="Ringkasan aktivitas dan sesi pertemuan terbaru.">
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <StatCard
            title="Total Murid"
            value={userCount?.student ?? 0}
            loading={loadingUsers}
            variant="solid"
            note="Increased from last month"
            onClick={() => navigate({ to: '/users/students' })}
          />
          <StatCard
            title="Total Mentor"
            value={userCount?.mentor ?? 0}
            loading={loadingUsers}
            variant="plain"
            note="Increased from last month"
            onClick={() => navigate({ to: '/users/mentors' })}
          />
        </div>

        <section className="flex flex-col gap-3">
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold tracking-tight">
              Sesi Meeting
            </h2>
            <p className="text-sm text-muted-foreground">
              Daftar sesi meeting yang dijadwalkan
            </p>
          </div>

          <Table
            key="table-meeting-sessions-dashboard"
            columns={[
              {
                accessorKey: 'student.name',
                header: 'Nama Murid',
                meta: { minWidth: '12rem' },
              },
              {
                accessorKey: 'mentor.name',
                header: 'Nama Mentor',
                meta: { minWidth: '12rem' },
              },
              {
                accessorKey: 'session_time',
                header: 'Waktu',
                meta: { minWidth: '7rem' },
              },
              {
                accessorKey: 'session_date',
                header: 'Tanggal',
                meta: { minWidth: '9rem' },
                cell: ({ cell }) => {
                  return format(
                    new Date(cell.getValue<string>()),
                    'dd MMMM yyyy',
                  )
                },
              },
            ]}
            data={meetingSessions}
            isLoading={isLoading}
            pagination={pagination}
            totalItems={data?.meta?.total ?? 0}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            searchValue={searchInput}
            onSearchChange={setSearchInput}
            toolbar={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Buka semua sesi meeting"
                onClick={() => navigate({ to: '/meeting-sessions' })}
              >
                <ExternalLink />
              </Button>
            }
          />
        </section>
      </div>
    </BasePageLayout>
  )
}
