import { useRef } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Trash2 } from 'lucide-react'

import type { Class } from '@/shared/types/response'
import type { ClassFormRef } from '@/features/classes/widgets/classes.form'
import { deleteClass, fetchClasses } from '@/entities/classes'
import { ClassForm } from '@/features/classes/widgets/classes.form'
import ClassActions from '@/features/classes/widgets/class.actions'
import { useHeaderStore } from '@/shared/hooks/use-header'
import { Button } from '@/shared/ui/button'
import { FormSheet } from '@/shared/ui/form-sheet'
import { Table } from '@/widgets/table'

export const Route = createFileRoute('/_authenticatedLayout/classes/')({
  component: RouteComponent,
  loader: () => {
    useHeaderStore.getState().setTitle('Kelas')
  },
})

function RouteComponent() {
  const createClassRef = useRef<ClassFormRef>(null)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['classes'],
    queryFn: fetchClasses,
    staleTime: Infinity,
    select: (classes) => classes ?? [],
  })

  const { mutate: handleDeleteClass } = useMutation({
    mutationFn: (classId: number) => deleteClass(classId),
    onSuccess: async () => {
      await refetch()
    },
  })

  const handleSubmitCreateClass = async () => {
    if (!createClassRef.current) {
      throw new Error('Form ref is not available')
    }

    await createClassRef.current.submit()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <FormSheet
          trigger={<Button>Tambah Kelas</Button>}
          title="Buat Kelas Baru"
          description="Tindakan ini akan membuat kelas baru, silakan isi formulir di bawah ini untuk melanjutkan."
          onSubmitForm={handleSubmitCreateClass}
          disabled={isLoading}
        >
          <ClassForm ref={createClassRef} />
        </FormSheet>
      </div>

      <Table<Class>
        columns={[
          {
            accessorKey: 'classname',
            header: 'Nama Kelas',
          },
          {
            header: 'Aksi',
            cell: ({ row }) => {
              return (
                <ClassActions
                  id={row.original.id}
                  classname={row.original.classname}
                  onEditSuccess={() => refetch()}
                  onDelete={(id) => handleDeleteClass(id)}
                />
              )
            },
          },
        ]}
        data={data}
        isLoading={isLoading}
      />
    </div>
  )
}
