import { useRef, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { ShieldAlert, ShieldCheck } from 'lucide-react'

import type { RegisterUserFormRef } from '@/features/users/widgets/user.form'
import { UserRowActions } from '@/features/users/widgets/user-row-actions'
import { useHeaderStore } from '@/shared/hooks/use-header'
import { useServerTable } from '@/shared/hooks/use-server-table'
import { useUserStore } from '@/shared/hooks/use-user'
import { forceActivateUser, getAllUsers } from '@/entities/users'
import { Table } from '@/widgets/table'
import { Button } from '@/shared/ui/button'
import { FormSheet } from '@/shared/ui/form-sheet'
import { RegisterUserForm } from '@/features/users/widgets/user.form'
import BasePageLayout from '@/widgets/base-page-layout'

export const Route = createFileRoute('/_authenticatedLayout/users/admins')({
  loader: () => {
    const setTitle = useHeaderStore.getState().setTitle
    setTitle('Kelola Admin')
  },
  component: RouteComponent,
})

function RouteComponent() {
  const isOwner = useUserStore((state) => state.isOwner)
  const formRef = useRef<RegisterUserFormRef>(null)
  const {
    pagination,
    params,
    search,
    searchInput,
    setSearchInput,
    setPage,
    setPageSize,
  } = useServerTable()

  const {
    data,
    isLoading,
    refetch: refetchUserList,
  } = useQuery({
    queryKey: [
      'users',
      'admins',
      pagination.currentPage,
      pagination.pageSize,
      search,
    ],
    queryFn: () => getAllUsers('admin', params),
    enabled: isOwner,
  })

  const users = data?.users ?? []

  const handleSubmitForm = async () => {
    if (!formRef.current) {
      throw new Error('Form ref is not available')
    }

    await formRef.current.submit()
  }

  const [activatedUserID, setActivatedUserID] = useState<number | null>(null)
  const { mutate: activateUser, isPending: activatingUser } = useMutation({
    mutationFn: (userID: number) => forceActivateUser(userID),
    onMutate: (id: number) => {
      setActivatedUserID(id)
    },
    onSettled: () => {
      setActivatedUserID(null)
    },
    onSuccess: async () => {
      await refetchUserList()
    },
  })

  if (!isOwner) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <div className="flex max-w-md flex-col items-center gap-4 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert className="size-7" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-semibold">Akses ditolak</h1>
            <p className="text-sm text-muted-foreground">
              Hanya pemilik tenant yang dapat mengelola administrator.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/">Kembali ke Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <BasePageLayout subtitle="Kelola administrator tenant. Admin baru perlu diaktifkan sebelum bisa masuk.">
      <div className="flex flex-col gap-4">
        <Table
          key={`table-${users?.length || 0}`}
          columns={[
            {
              accessorKey: 'name',
              header: 'Nama',
              meta: { minWidth: '12rem' },
            },
            {
              accessorKey: 'email',
              header: 'Email',
              meta: { minWidth: '16rem' },
            },
            {
              accessorKey: 'is_owner',
              header: 'Peran',
              meta: { minWidth: '8rem' },
              cell: ({ row }) =>
                row.original.is_owner ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    <ShieldCheck className="size-3" />
                    Pemilik
                  </span>
                ) : (
                  <span className="text-sm">Admin</span>
                ),
            },
            {
              accessorKey: 'is_active',
              header: 'Status',
              meta: { minWidth: '10rem' },
              cell: ({ row }) => {
                const isActive =
                  !!row.original.email_verified_at && !!row.original.is_active

                return (
                  <span
                    className={
                      isActive
                        ? 'text-sm text-emerald-600'
                        : 'text-sm text-amber-600'
                    }
                  >
                    {isActive ? 'Aktif' : 'Menunggu Aktivasi'}
                  </span>
                )
              },
            },
            {
              accessorKey: 'created_at',
              header: 'Dibuat Pada',
              meta: { minWidth: '9rem' },
              cell: ({ row }) => {
                const date = new Date(row.original.created_at)
                return date.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                })
              },
            },
            {
              header: 'Aksi',
              meta: { fixed: 'right' },
              cell: ({ row }) => (
                <UserRowActions
                  user={row.original}
                  canDelete={false}
                  activateLabel="Aktifkan Admin"
                  activateDescription="Tindakan ini akan mengaktifkan akun admin dan memperbarui datanya di server kami."
                  isActivating={activatingUser}
                  activatingId={activatedUserID}
                  onActivate={activateUser}
                />
              ),
            },
          ]}
          data={users}
          isLoading={isLoading}
          pagination={pagination}
          totalItems={data?.meta?.total ?? 0}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          toolbar={
            <FormSheet
              preventClose
              onBeforeClose={() => true}
              trigger={<Button>Tambah Admin</Button>}
              title="Buat Admin Baru"
              description="Tindakan ini akan membuat admin baru di tenant Anda. Silakan isi formulir di bawah ini untuk melanjutkan."
              onSubmitForm={handleSubmitForm}
              disabled={isLoading}
            >
              <RegisterUserForm ref={formRef} fixedRole="admin" />
            </FormSheet>
          }
        />
      </div>
    </BasePageLayout>
  )
}
