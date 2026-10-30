import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Edit, Loader2, Plus, Trash } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import z from 'zod'
import { createColumnHelper } from '@tanstack/react-table'
import type { Program } from '@/shared/types/response'
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
import { Button } from '@/shared/ui/button'
import { FormSheet } from '@/shared/ui/form-sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import BasePageLayout from '@/widgets/base-page-layout'
import { RowActions, Table } from '@/widgets/table'
import { useAppForm } from '@/shared/hooks/form'
import { useHeaderStore } from '@/shared/hooks/use-header'
import { useServerTable } from '@/shared/hooks/use-server-table'
import {
  createProgram,
  deleteProgram,
  getPrograms,
  updateProgram,
} from '@/entities/programs'

export const Route = createFileRoute('/_authenticatedLayout/programs/')({
  loader: () => {
    const setTitle = useHeaderStore.getState().setTitle
    setTitle('Program')
  },
  component: RouteComponent,
})

const programSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  image_url: z.string().url('Invalid URL'),
})

const columnHelper = createColumnHelper<Program>()

function ProgramRowActions({
  program,
  isDeleting,
  onEdit,
  onDelete,
}: {
  program: Program
  isDeleting: boolean
  onEdit: (program: Program) => void
  onDelete: (id: number) => void
}) {
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <>
      <RowActions
        actions={[
          {
            key: 'edit',
            node: null,
            alwaysOverflow: true,
            overflow: {
              icon: <Edit className="h-4 w-4" />,
              label: 'Edit Program',
              onSelect: () => onEdit(program),
            },
          },
          {
            key: 'delete',
            node: null,
            alwaysOverflow: true,
            overflow: {
              icon: <Trash className="h-4 w-4" />,
              label: 'Hapus Program',
              variant: 'destructive',
              onSelect: () => setDeleteOpen(true),
            },
          },
        ]}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Program</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus program{' '}
              <strong>{program.title}</strong>? Tindakan ini tidak dapat
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(program.id)}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function RouteComponent() {
  const queryClient = useQueryClient()
  const [openForm, setOpenForm] = useState(false)
  const [editingProgram, setEditingProgram] = useState<Program | null>(null)

  const {
    pagination,
    params,
    search,
    searchInput,
    setSearchInput,
    setPage,
    setPageSize,
  } = useServerTable()

  const { data, isLoading: loadingPrograms } = useQuery({
    queryKey: ['programs', pagination.currentPage, pagination.pageSize, search],
    queryFn: () => getPrograms(params),
    staleTime: 1000 * 60 * 5,
  })

  const programs = data?.programs ?? []

  const form = useAppForm({
    defaultValues: {
      title: '',
      description: '',
      image_url: '',
    },
    validators: {
      onSubmit: programSchema,
    },
    onSubmitInvalid: () => {
      throw new Error('Invalid form submission')
    },
    onSubmit: async (values) => {
      const payload = {
        title: values.value.title,
        description: values.value.description,
        image_url: values.value.image_url || null,
      }
      if (editingProgram) {
        await updateProgram(editingProgram.id, payload)
      } else {
        await createProgram(payload)
      }

      queryClient.invalidateQueries({ queryKey: ['programs'] })
    },
  })

  const { mutateAsync: deleteProgramMutation, isPending: deletingProgram } =
    useMutation({
      mutationFn: (programID: number) => deleteProgram(programID),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ['programs'] })
      },
    })

  const handleEdit = useCallback(
    (program: Program) => {
      setEditingProgram(program)
      form.setFieldValue('title', program.title)
      form.setFieldValue('description', program.description)
      form.setFieldValue('image_url', program.image_url || '')
      setOpenForm(true)
    },
    [form],
  )

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setEditingProgram(null)
      form.reset()
    }
    setOpenForm(open)
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('title', {
        header: 'Nama Program',
        meta: { minWidth: '14rem' },
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor('description', {
        header: 'Deskripsi',
        meta: { minWidth: '20rem' },
        cell: (info) => (
          <div className="max-w-[400px] truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor('image_url', {
        header: 'Gambar',
        meta: { minWidth: '5rem' },
        cell: (info) => {
          const url = info.getValue()
          return url ? (
            <Dialog>
              <DialogTrigger asChild>
                <img
                  src={url}
                  alt="Program"
                  className="w-12 h-12 object-cover rounded-md border cursor-zoom-in hover:opacity-80 transition-opacity"
                />
              </DialogTrigger>
              <DialogContent className="sm:max-w-3xl">
                <DialogHeader className="sr-only">
                  <DialogTitle>Preview Gambar</DialogTitle>
                </DialogHeader>
                <div className="flex items-center justify-center pt-4">
                  <img
                    src={url}
                    alt="Program"
                    className="max-w-full max-h-[75vh] object-contain rounded-md shadow-sm"
                  />
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <span className="text-gray-400 italic">Tidak ada gambar</span>
          )
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Aksi',
        meta: { fixed: 'right' },
        cell: ({ row }) => (
          <ProgramRowActions
            program={row.original}
            isDeleting={deletingProgram}
            onEdit={handleEdit}
            onDelete={deleteProgramMutation}
          />
        ),
      }),
    ],
    [deletingProgram, deleteProgramMutation, handleEdit],
  )

  return (
    <BasePageLayout subtitle="Kelola program yang ditampilkan di website.">
      <div className="w-full">
        <div className="bg-white rounded-lg border">
          <Table
            columns={columns}
            data={programs}
            isLoading={loadingPrograms}
            pagination={pagination}
            totalItems={data?.meta?.total ?? 0}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            searchValue={searchInput}
            onSearchChange={setSearchInput}
            toolbar={
              <FormSheet
                open={openForm}
                onOpenChange={handleOpenChange}
                trigger={
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Program
                  </Button>
                }
                title={editingProgram ? 'Edit Program' : 'Tambah Program'}
                description="Isi form di bawah ini untuk menyimpan data program."
                onSubmitForm={async () => {
                  await form.handleSubmit()
                }}
              >
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    form.handleSubmit()
                  }}
                  className="space-y-4 px-4"
                >
                  <form.AppField name="title">
                    {({ TextField }) => (
                      <TextField
                        label="Nama Program"
                        placeholder="Masukkan nama program"
                        name="title"
                      />
                    )}
                  </form.AppField>

                  <form.AppField name="image_url">
                    {({ TextField }) => (
                      <TextField
                        label="URL Gambar Program (Opsional)"
                        placeholder="Masukkan URL gambar (misal: https://example.com/image.jpg)"
                        name="image_url"
                      />
                    )}
                  </form.AppField>

                  <form.AppField name="description">
                    {({ TextArea }) => (
                      <TextArea label="Deskripsi Program" required rows={8} />
                    )}
                  </form.AppField>
                </form>
              </FormSheet>
            }
          />
        </div>
      </div>
    </BasePageLayout>
  )
}
