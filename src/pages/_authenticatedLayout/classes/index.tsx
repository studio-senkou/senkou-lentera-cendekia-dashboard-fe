import { useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { fetchClasses } from '@/entities/classes'
import { ClassForm } from '@/features/classes/widgets/classes.form'
import type { ClassFormRef } from '@/features/classes/widgets/classes.form'
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

  const { data, isLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: fetchClasses,
    staleTime: Infinity,
    select: (data) => data ?? [],
  })

  const handleSubmitCreateClass = async () => {
    if (!createClassRef.current) {
      throw new Error('Form ref is not available')
    }

    try {
      await createClassRef.current.submit()
    } catch (error) {
      throw error
    }
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

      <Table
        columns={[
          {
            accessorKey: 'classname',
            header: 'Nama Kelas',
          },
        ]}
        data={data}
        isLoading={isLoading}
      />
    </div>
  )
}
