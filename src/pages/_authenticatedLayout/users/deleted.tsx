import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Loader2, RotateCcw } from 'lucide-react'

import { useHeaderStore } from '@/shared/hooks/use-header'
import { getDeletedUsers, restoreUser } from '@/entities/users'
import { Table } from '@/widgets/table'
import { Button } from '@/shared/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/tooltip'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/ui/alert-dialog'

export const Route = createFileRoute('/_authenticatedLayout/users/deleted')({
  loader: () => {
    const setTitle = useHeaderStore.getState().setTitle
    setTitle('Pengguna Terhapus')
  },
  component: RouteComponent,
})

function RouteComponent() {
  const {
    data: users,
    isLoading,
    refetch: refetchUserList,
  } = useQuery({
    queryKey: ['deleted-users'],
    queryFn: getDeletedUsers,
  })

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
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-start">
        <Button asChild variant="outline">
          <Link to="/users">Kembali ke Daftar Pengguna</Link>
        </Button>
      </div>

      <Table
        key={`table-${users?.length || 0}`}
        columns={[
          {
            accessorKey: 'name',
            header: 'Nama',
          },
          {
            accessorKey: 'email',
            header: 'Email',
          },
          {
            accessorKey: 'role',
            header: 'Peran',
            cell: ({ row }) => (
              <span className="capitalize">{row.original.role}</span>
            ),
          },
          {
            accessorKey: 'deleted_at',
            header: 'Dihapus Pada',
            cell: ({ row }) => {
              const date = new Date(row.original.deleted_at || row.original.updated_at || row.original.created_at)
              return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              })
            },
          },
          {
            header: 'Aksi',
            cell: ({ row }) => {
              return (
                <TooltipProvider>
                  <div className="flex items-center justify-end gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="default"
                              size="icon"
                              aria-label="Kembalikan Pengguna"
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              {restoringUser && row.original.id === restoredUserID ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <RotateCcw className="h-4 w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Kembalikan Pengguna
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Apakah Anda yakin ingin mengembalikan pengguna ini? Pengguna akan kembali aktif di sistem.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => doRestoreUser(row.original.id)}
                              >
                                Kembalikan
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Kembalikan Pengguna</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
              )
            },
          },
        ]}
        data={users || []}
        isLoading={isLoading}
      />
    </div>
  )
}
