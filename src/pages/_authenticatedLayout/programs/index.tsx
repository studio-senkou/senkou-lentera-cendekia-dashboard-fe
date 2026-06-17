import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Edit, Loader2, Plus, Trash } from 'lucide-react'
import { useMemo, useState } from 'react'
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
  AlertDialogTrigger,
} from '@/shared/ui/alert-dialog'
import { Button } from '@/shared/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import { Table } from '@/widgets/table'
import { useAppForm } from '@/shared/hooks/form'
import { useHeaderStore } from '@/shared/hooks/use-header'
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

function RouteComponent() {
  const queryClient = useQueryClient()
  const [openForm, setOpenForm] = useState(false)
  const [editingProgram, setEditingProgram] = useState<Program | null>(null)

  const { data: programs, isLoading: loadingPrograms } = useQuery({
    queryKey: ['programs'],
    queryFn: getPrograms,
    staleTime: 1000 * 60 * 5,
  })

  const form = useAppForm({
    defaultValues: {
      title: '',
      description: '',
      image_url: '',
    },
    validators: {
      onSubmit: programSchema,
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

      form.reset()
      setEditingProgram(null)
      setOpenForm(false)
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

  const handleEdit = (program: Program) => {
    setEditingProgram(program)
    form.setFieldValue('title', program.title)
    form.setFieldValue('description', program.description)
    form.setFieldValue('image_url', program.image_url || '')
    setOpenForm(true)
  }

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
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor('description', {
        header: 'Deskripsi',
        cell: (info) => (
          <div className="max-w-[400px] truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor('image_url', {
        header: 'Gambar',
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
                  <img src={url} alt="Program" className="max-w-full max-h-[75vh] object-contain rounded-md shadow-sm" />
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
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEdit(row.original)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash className="h-4 w-4 mr-1" />
                  Hapus
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus Program</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah Anda yakin ingin menghapus program "
                    {row.original.title}"? Tindakan ini tidak dapat dibatalkan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      await deleteProgramMutation(row.original.id)
                    }}
                  >
                    {deletingProgram && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Ya, Hapus
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ),
      }),
    ],
    [deletingProgram, deleteProgramMutation],
  )

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Daftar Program</h1>

        <Sheet open={openForm} onOpenChange={handleOpenChange}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Program
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-xl overflow-y-auto px-4">
            <SheetHeader className="mb-6">
              <SheetTitle>
                {editingProgram ? 'Edit Program' : 'Tambah Program'}
              </SheetTitle>
              <SheetDescription>
                Isi form di bawah ini untuk menyimpan data program.
              </SheetDescription>
            </SheetHeader>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                form.handleSubmit()
              }}
              className="space-y-4"
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

              <div className="mt-8 flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="bg-white"
                  onClick={() => setOpenForm(false)}
                >
                  Batal
                </Button>
                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                >
                  {([canSubmit, isSubmitting]) => (
                    <Button type="submit" disabled={!canSubmit}>
                      {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      {editingProgram ? 'Simpan Perubahan' : 'Simpan Program'}
                    </Button>
                  )}
                </form.Subscribe>
              </div>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      <div className="bg-white rounded-lg border">
        <Table
          columns={columns}
          data={programs || []}
          isLoading={loadingPrograms}
        />
      </div>
    </div>
  )
}
