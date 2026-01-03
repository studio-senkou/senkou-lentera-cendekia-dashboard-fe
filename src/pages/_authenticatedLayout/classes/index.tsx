import { useRef } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Trash2 } from 'lucide-react'

import { deleteClass, fetchClasses } from '@/entities/classes'
import type { Class } from '@/shared/types/response'
import { ClassForm } from '@/features/classes/widgets/classes.form'
import type { ClassFormRef } from '@/features/classes/widgets/classes.form'
import { useHeaderStore } from '@/shared/hooks/use-header'
import { Button } from '@/shared/ui/button'
import { FormSheet } from '@/shared/ui/form-sheet'
import { Table } from '@/widgets/table'
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
    select: (data) => data ?? [],
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
                <TooltipProvider>
                  <div className="flex items-center justify-end gap-2">
                    <Tooltip>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <TooltipTrigger asChild>
                            <Button
                              variant="destructive"
                              size="icon"
                              aria-label="Hapus Kelas"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Apakah Anda yakin?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus
                              kelas <strong>{row.original.classname}</strong> secara
                              permanen dari server.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteClass(row.original.id)}
                            >
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <TooltipContent>
                        <p>Hapus Kelas</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
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
