import { useRef } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import type { Class } from '@/shared/types/response'
import type { ClassFormRef } from '@/features/classes/widgets/classes.form'
import { deleteClass, fetchClasses } from '@/entities/classes'
import { ClassForm } from '@/features/classes/widgets/classes.form'
import ClassActions from '@/features/classes/widgets/class.actions'
import { useHeaderStore } from '@/shared/hooks/use-header'
import { useServerTable } from '@/shared/hooks/use-server-table'
import { Button } from '@/shared/ui/button'
import { FormSheet } from '@/shared/ui/form-sheet'
import BasePageLayout from '@/widgets/base-page-layout'
import { Table } from '@/widgets/table'

export const Route = createFileRoute('/_authenticatedLayout/classes/')({
  component: RouteComponent,
  loader: () => {
    useHeaderStore.getState().setTitle('Kelas')
  },
})

function RouteComponent() {
  const createClassRef = useRef<ClassFormRef>(null)
  const {
    pagination,
    params,
    search,
    searchInput,
    setSearchInput,
    setPage,
    setPageSize,
  } = useServerTable()

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['classes', pagination.currentPage, pagination.pageSize, search],
    queryFn: () => fetchClasses(params),
    staleTime: Infinity,
  })

  const classes = data?.classes ?? []

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
    <BasePageLayout subtitle="Kelola kelas yang tersedia di platform.">
      <div className="flex flex-col gap-4">
        <Table<Class>
          columns={[
            {
              accessorKey: 'classname',
              header: 'Nama Kelas',
              meta: { minWidth: '14rem' },
            },
            {
              header: 'Aksi',
              meta: { fixed: 'right' },
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
          data={classes}
          isLoading={isLoading}
          pagination={pagination}
          totalItems={data?.meta?.total ?? 0}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          toolbar={
            <FormSheet
              trigger={<Button>Tambah Kelas</Button>}
              title="Buat Kelas Baru"
              description="Tindakan ini akan membuat kelas baru, silakan isi formulir di bawah ini untuk melanjutkan."
              onSubmitForm={handleSubmitCreateClass}
              disabled={isLoading}
            >
              <ClassForm ref={createClassRef} />
            </FormSheet>
          }
        />
      </div>
    </BasePageLayout>
  )
}
