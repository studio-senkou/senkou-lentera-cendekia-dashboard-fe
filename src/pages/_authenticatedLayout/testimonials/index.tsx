import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Edit, Loader2, Plus, Trash } from 'lucide-react'
import { useMemo, useState } from 'react'
import z from 'zod'
import { createColumnHelper } from '@tanstack/react-table'
import type { Testimonial } from '@/shared/types/response'
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
  createTestimonial,
  deleteTestimonial,
  getTestimonials,
  updateTestimonial,
} from '@/entities/testimonials'

export const Route = createFileRoute('/_authenticatedLayout/testimonials/')({
  loader: () => {
    const setTitle = useHeaderStore.getState().setTitle
    setTitle('Testimonial')
  },
  component: RouteComponent,
})

const testimonialSchema = z.object({
  testimoner_name: z.string().min(1, 'Nama required'),
  testimoner_position: z.string().min(1, 'Posisi required'),
  testimoner_photo: z.string().url('Invalid URL').or(z.literal('')),
  testimony_text: z.string().min(1, 'Testimoni required'),
  is_active: z.boolean(),
  gender: z.enum(['man', 'woman', 'man-woman']),
})

const columnHelper = createColumnHelper<Testimonial>()

function RouteComponent() {
  const queryClient = useQueryClient()
  const [openForm, setOpenForm] = useState(false)
  const [editingData, setEditingData] = useState<Testimonial | null>(null)

  const { data: testimonials, isLoading: loadingData } = useQuery({
    queryKey: ['testimonials'],
    queryFn: getTestimonials,
    staleTime: 1000 * 60 * 5,
  })

  const form = useAppForm({
    defaultValues: {
      testimoner_name: '',
      testimoner_position: '',
      testimoner_photo: '',
      testimony_text: '',
      is_active: true,
      gender: 'man',
    },
    validators: {
      onSubmit: testimonialSchema,
    },
    onSubmit: async (values) => {
      const payload = {
        testimoner_name: values.value.testimoner_name,
        testimoner_position: values.value.testimoner_position,
        testimony_text: values.value.testimony_text,
        is_active: values.value.is_active,
        gender: values.value.gender as 'man' | 'woman' | 'man-woman',
        testimoner_photo: values.value.testimoner_photo || null,
      }

      if (editingData) {
        await updateTestimonial(editingData.id, payload)
      } else {
        await createTestimonial(payload)
      }

      form.reset()
      setEditingData(null)
      setOpenForm(false)
      queryClient.invalidateQueries({ queryKey: ['testimonials'] })
    },
  })

  const { mutateAsync: deleteMutation, isPending: deleting } = useMutation({
    mutationFn: (id: number) => deleteTestimonial(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['testimonials'] })
    },
  })

  const handleEdit = (data: Testimonial) => {
    setEditingData(data)
    form.setFieldValue('testimoner_name', data.testimoner_name)
    form.setFieldValue('testimoner_position', data.testimoner_position)
    form.setFieldValue('testimony_text', data.testimony_text)
    form.setFieldValue('testimoner_photo', data.testimoner_photo || '')
    form.setFieldValue('is_active', data.is_active)
    form.setFieldValue('gender', data.gender)
    setOpenForm(true)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setEditingData(null)
      form.reset()
    }
    setOpenForm(open)
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('testimoner_photo', {
        header: 'Foto',
        cell: (info) => {
          const url = info.getValue()
          return url ? (
            <Dialog>
              <DialogTrigger asChild>
                <img
                  src={url}
                  alt="Foto"
                  className="w-10 h-10 object-cover rounded-full border cursor-zoom-in hover:opacity-80 transition-opacity"
                />
              </DialogTrigger>
              <DialogContent className="sm:max-w-xl">
                <DialogHeader className="sr-only">
                  <DialogTitle>Preview Foto</DialogTitle>
                </DialogHeader>
                <div className="flex items-center justify-center pt-4">
                  <img
                    src={url}
                    alt="Foto"
                    className="max-w-full max-h-[75vh] object-contain rounded-md shadow-sm"
                  />
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <span className="text-gray-400 italic text-xs">No photo</span>
          )
        },
      }),
      columnHelper.accessor('testimoner_name', {
        header: 'Nama',
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor('testimoner_position', {
        header: 'Posisi',
      }),
      columnHelper.accessor('testimony_text', {
        header: 'Testimoni',
        cell: (info) => (
          <div className="line-clamp-3 max-w-[350px]" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor('gender', {
        header: 'Gender',
        cell: (info) => (
          <span className="capitalize">
            {info.getValue().replace('-', ' & ')}
          </span>
        ),
      }),
      columnHelper.accessor('is_active', {
        header: 'Status',
        cell: (info) => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${info.getValue() ? 'bg-green-100 text-green-800' : 'bg-neutral-100 text-neutral-800'}`}
          >
            {info.getValue() ? 'Aktif' : 'Tidak Aktif'}
          </span>
        ),
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
                  <AlertDialogTitle>Hapus Testimonial</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah Anda yakin ingin menghapus testimonial dari "
                    {row.original.testimoner_name}"? Tindakan ini tidak dapat
                    dibatalkan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      await deleteMutation(row.original.id)
                    }}
                  >
                    {deleting && (
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
    [deleting, deleteMutation],
  )

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Daftar Testimonial</h1>

        <Sheet open={openForm} onOpenChange={handleOpenChange}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Testimonial
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-xl overflow-y-auto px-5">
            <SheetHeader className="mb-6">
              <SheetTitle>
                {editingData ? 'Edit Testimonial' : 'Tambah Testimonial'}
              </SheetTitle>
              <SheetDescription>
                Isi form di bawah ini untuk menyimpan data testimonial.
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
              <form.AppField name="testimoner_name">
                {({ TextField }) => (
                  <TextField
                    label="Nama"
                    placeholder="Masukkan nama"
                    name="testimoner_name"
                  />
                )}
              </form.AppField>

              <form.AppField name="testimoner_position">
                {({ TextField }) => (
                  <TextField
                    label="Posisi / Profesi"
                    placeholder="Masukkan posisi"
                    name="testimoner_position"
                  />
                )}
              </form.AppField>

              <form.AppField name="testimoner_photo">
                {({ TextField }) => (
                  <TextField
                    label="URL Foto (Opsional)"
                    placeholder="Masukkan URL foto"
                    name="testimoner_photo"
                  />
                )}
              </form.AppField>

              <form.AppField name="gender">
                {({ Select }) => (
                  <Select
                    label="Gender"
                    values={[
                      { label: 'Laki-laki (Man)', value: 'man' },
                      { label: 'Perempuan (Woman)', value: 'woman' },
                      { label: 'Keduanya (Man-Woman)', value: 'man-woman' },
                    ]}
                  />
                )}
              </form.AppField>

              <form.AppField name="testimony_text">
                {({ TextArea }) => (
                  <TextArea label="Isi Testimonial" rows={6} />
                )}
              </form.AppField>

              <div className="pt-2">
                <form.AppField name="is_active">
                  {({ Switch }) => <Switch label="Aktifkan Testimonial" />}
                </form.AppField>
              </div>

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
                      {editingData ? 'Simpan Perubahan' : 'Simpan Testimonial'}
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
          data={testimonials || []}
          isLoading={loadingData}
        />
      </div>
    </div>
  )
}
