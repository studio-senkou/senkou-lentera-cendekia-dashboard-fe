import { useRef, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { BookText, Check, Loader2 } from 'lucide-react'

import { useHeaderStore } from '@/shared/hooks/use-header'
import { forceActivateUser, getAllUsers } from '@/entities/users'
import { Table } from '@/widgets/table'
import { Button } from '@/shared/ui/button'
import { FormSheet } from '@/shared/ui/form-sheet'
import {
  RegisterUserForm,
  type RegisterUserFormRef,
} from '@/features/users/widgets/user.form'
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

export const Route = createFileRoute('/_authenticatedLayout/users/')({
  loader: () => {
    const setTitle = useHeaderStore.getState().setTitle
    setTitle('Pengguna')
  },
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()

  const formRef = useRef<RegisterUserFormRef>(null)

  const {
    data: users,
    isLoading,
    refetch: refetchUserList,
  } = useQuery({
    queryKey: ['users'],
    queryFn: getAllUsers,
  })

  const handleSubmitForm = async () => {
    if (!formRef.current) {
      throw new Error('Form ref is not available')
    }

    try {
      await formRef.current.submit()
    } catch (error) {
      throw error
    }
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

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-end">
        {/* <h1 className="text-2xl font-medium">List Pengguna</h1> */}
        <FormSheet
          trigger={<Button>Tambah Pengguna</Button>}
          title="Buat Pengguna Baru"
          description="Tindakan ini akan membuat pengguna baru. Silakan isi formulir di bawah ini untuk melanjutkan."
          onSubmitForm={handleSubmitForm}
          disabled={isLoading}
        >
          <RegisterUserForm ref={formRef} />
        </FormSheet>
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
            accessorKey: 'created_at',
            header: 'Dibuat Pada',
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
            cell: ({ row }) => {
              const isActive =
                !!row.original.email_verified_at && !!row.original.is_active

              const UserActivationButton = ({ disabled = false }) => {
                return (
                  <AlertDialog>
                    <AlertDialogTrigger>
                      <Button
                        variant="success"
                        size="icon"
                        disabled={disabled}
                        className="mr-2"
                        aria-label="Selesaikan Sesi Pertemuan"
                      >
                        {activatingUser &&
                        row.original.id === activatedUserID ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete your account and remove your data from our
                          servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => activateUser(row.original.id)}
                        >
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )
              }

              return (
                <TooltipProvider>
                  <div className="flex items-center justify-end gap-2">
                    {row.original.role === 'user' && (
                      <Tooltip>
                        <TooltipTrigger>
                          <Button
                            variant="default"
                            className="bg-[#125E8A] hover:bg-[#0e4b6b] text-white"
                            onClick={() =>
                              navigate({
                                to: '/meeting-sessions/$user',
                                params: { user: row.original.id.toString() },
                              })
                            }
                          >
                            <BookText />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Sesi Meeting Murid</p>
                        </TooltipContent>
                      </Tooltip>
                    )}

                    {!isActive ? (
                      <Tooltip
                        defaultOpen={false}
                        disableHoverableContent={isActive}
                      >
                        <TooltipTrigger>
                          <UserActivationButton />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Aktifkan User</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <UserActivationButton disabled />
                    )}
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
