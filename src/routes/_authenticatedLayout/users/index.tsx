import { FormSheet } from '@/components/forms/form-sheet'
import {
  RegisterUserForm,
  type RegisterUserFormRef,
} from '@/components/forms/user-form'
import { Table } from '@/components/table'
import { Button } from '@/components/ui/button'
import { getAllUsers } from '@/lib/users'
import type { User } from '@/types/response'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useRef } from 'react'

export const Route = createFileRoute('/_authenticatedLayout/users/')({
  component: RouteComponent,
})

function RouteComponent() {
  const formRef = useRef<RegisterUserFormRef>(null)

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getAllUsers,
    select: (data) =>
      data.data.users.map((user: User) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
        role: user.role === 'mentor' ? 'Mentor' : 'Murid',
      })) ?? [],
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

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium">List Pengguna</h1>
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
        ]}
        data={users || []}
      />
    </div>
  )
}
