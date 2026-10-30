import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { Loader2, RotateCcw } from 'lucide-react'

import type { User } from '@/shared/types/response'
import { useHeaderStore } from '@/shared/hooks/use-header'
import { useServerTable } from '@/shared/hooks/use-server-table'
import { getDeletedUsers, restoreUser } from '@/entities/users'
import BasePageLayout from '@/widgets/base-page-layout'
import { RowActions, Table } from '@/widgets/table'
import { Button } from '@/shared/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog'

export const Route = createFileRoute('/_authenticatedLayout/users/deleted')({
  loader: () => {
    const setTitle = useHeaderStore.getState().setTitle
    setTitle('Pengguna Terhapus')
  },
  component: RouteComponent,
})

function DeletedUserRowActions({
  user,
  isRestoring,
  restoringId,
  onRestore,
}: {
  user: User
  isRestoring: boolean
  restoringId: number | null
  onRestore: (id: number) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <RowActions
        actions={[
          {
            key: 'restore',
            node: null,
            alwaysOverflow: true,
            overflow: {
              icon: <RotateCcw className="h-4 w-4" />,
              label: 'Kembalikan Pengguna',
              onSelect: () => setOpen(true),
            },
          },
        ]}
      />

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kembalikan Pengguna</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin mengembalikan <strong>{user.name}</strong>
              ? Pengguna akan kembali aktif di sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onRestore(user.id)}
              disabled={isRestoring && restoringId === user.id}
            >
              {isRestoring && restoringId === user.id && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Kembalikan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function RouteComponent() {
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
      'deleted-users',
      pagination.currentPage,
      pagination.pageSize,
      search,
    ],
    queryFn: () => getDeletedUsers(params),
  })

  const users = data?.users ?? []

  const [restoredUserID, setRestoredUserID] = useState<number | null>(null)
  const { mutate: doRestoreUser, isPending: restoringUser } = useMutation({
    mutationFn: (userID: number) => restoreUser(userID),
    onMutate: (id: number) => {
      setRestoredUserID(id)
    },
    onSettled: () => {
      setRestoredUserID(null)
    },
    onSuccess: async () => {
      await refetchUserList()
    },
  })

  return (
    <BasePageLayout subtitle="Tinjau dan pulihkan pengguna yang telah dihapus.">
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
              accessorKey: 'deleted_at',
              header: 'Dihapus Pada',
              meta: { minWidth: '9rem' },
              cell: ({ row }) => {
                const date = new Date(
                  row.original.updated_at || row.original.created_at,
                )
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
                <DeletedUserRowActions
                  user={row.original}
                  isRestoring={restoringUser}
                  restoringId={restoredUserID}
                  onRestore={doRestoreUser}
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
            <Button asChild variant="outline">
              <Link to="/users/students">Kembali ke Daftar Pengguna</Link>
            </Button>
          }
        />
      </div>
    </BasePageLayout>
  )
}
