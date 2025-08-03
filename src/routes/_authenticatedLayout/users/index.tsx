import { Check, Loader2 } from 'lucide-react'
import { FormSheet } from '@/components/forms/form-sheet'
import {
  RegisterUserForm,
  type RegisterUserFormRef,
} from '@/components/forms/user-form'
import { Table } from '@/components/table'
import { Button } from '@/components/ui/button'
import { forceActivateUser, getAllUsers } from '@/lib/users'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import { useHeaderStore } from '@/integrations/zustand/hooks/use-header'

export const Route = createFileRoute('/_authenticatedLayout/users/')({
  loader: () => {
    const setTitle = useHeaderStore.getState().setTitle
    setTitle('Pengguna')
  },
  component: RouteComponent,
})

function RouteComponent() {
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
            cell: ({ row }) => (
              <div className="flex items-center gap-2">
                <Button
                  variant="success"
                  size="icon"
                  onClick={() => activateUser(row.original.id)}
                  disabled={
                    !!row.original.email_verified_at && !!row.original.is_active
                  }
                  className="mr-2"
                  aria-label="Selesaikan Sesi Pertemuan"
                >
                  {activatingUser && row.original.id === activatedUserID ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ),
          },
        ]}
        data={users || []}
      />
    </div>
  )
}
