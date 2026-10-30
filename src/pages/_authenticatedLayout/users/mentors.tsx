import { useRef, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import type { RegisterUserFormRef } from '@/features/users/widgets/user.form'
import { UserRowActions } from '@/features/users/widgets/user-row-actions'
import { useHeaderStore } from '@/shared/hooks/use-header'
import { useServerTable } from '@/shared/hooks/use-server-table'
import { deleteUser, forceActivateUser, getAllUsers } from '@/entities/users'
import { Table } from '@/widgets/table'
import { Button } from '@/shared/ui/button'
import { FormSheet } from '@/shared/ui/form-sheet'
import { RegisterUserForm } from '@/features/users/widgets/user.form'
import BasePageLayout from '@/widgets/base-page-layout'

export const Route = createFileRoute('/_authenticatedLayout/users/mentors')({
  loader: () => {
    const setTitle = useHeaderStore.getState().setTitle
    setTitle('Daftar Tentor')
  },
  component: RouteComponent,
})

function RouteComponent() {
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
      'mentors',
      pagination.currentPage,
      pagination.pageSize,
      search,
    ],
    queryFn: () => getAllUsers('mentor', params),
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

  const [deletedUserID, setDeletedUserID] = useState<number | null>(null)
  const { mutate: doDeleteUser, isPending: deletingUser } = useMutation({
    mutationFn: (userID: number) => deleteUser(userID),
    onMutate: (id: number) => {
      setDeletedUserID(id)
    },
    onSettled: () => {
      setDeletedUserID(null)
    },
    onSuccess: async () => {
      await refetchUserList()
    },
  })

  return (
    <BasePageLayout subtitle="Kelola akun tentor yang terdaftar.">
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
              accessorKey: 'role',
              header: 'Peran',
              meta: { minWidth: '7rem' },
              cell: ({ row }) => (
                <span className="capitalize">{row.original.role}</span>
              ),
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
                  showSessions
                  isActivating={activatingUser}
                  activatingId={activatedUserID}
                  isDeleting={deletingUser}
                  deletingId={deletedUserID}
                  onActivate={activateUser}
                  onDelete={doDeleteUser}
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
              trigger={<Button>Tambah Tentor</Button>}
              title="Buat Tentor Baru"
              description="Tindakan ini akan membuat tentor baru. Silakan isi formulir di bawah ini untuk melanjutkan."
              onSubmitForm={handleSubmitForm}
              disabled={isLoading}
            >
              <RegisterUserForm ref={formRef} fixedRole="mentor" />
            </FormSheet>
          }
        />
      </div>
    </BasePageLayout>
  )
}
