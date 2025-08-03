import { FormSheet } from '@/components/forms/form-sheet'
import {
  TestimonyForm,
  type TestimonyFormRef,
} from '@/components/forms/testimony-form'
import {
  UpdateTestimonyForm,
  type UpdateTestimonyFormRef,
} from '@/components/forms/update-testimony-form'
import { Table } from '@/components/table'
import { Button } from '@/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { getAllStaticAssets, storeNewAsset } from '@/lib/static_asset'
import { deleteTestimony, getAllTestimonies } from '@/lib/testimony'
import { cn } from '@/lib/utils'
import type { StaticAsset, Testimony } from '@/types/response'
import { getAsset } from '@/utils/assets'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { formatDate } from 'date-fns'
import { Edit2, Loader2, Plus, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'

export const Route = createFileRoute('/_authenticatedLayout/page-settings/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: staticAssets, refetch: refetchStaticAssets } = useQuery<
    StaticAsset[]
  >({
    queryKey: ['page-static-assets'],
    queryFn: getAllStaticAssets,
    staleTime: 1000 * 60 * 5,
  })

  const { data: testimonies, refetch: refetchTestimonies } = useQuery({
    queryKey: ['testimonies'],
    queryFn: getAllTestimonies,
    staleTime: 1000 * 60 * 5,
  })

  const { mutateAsync: uploadAsset, isPending: uploadingAsset } = useMutation({
    mutationFn: (asset: File) => storeNewAsset(asset),
    onSuccess: async () => {
      await refetchStaticAssets()
    },
  })

  const formTestimonyRef = useRef<TestimonyFormRef>(null)

  const handleSubmitForm = async () => {
    if (!formTestimonyRef.current) {
      throw new Error('Form ref is not available')
    }

    try {
      await formTestimonyRef.current.submit()
    } catch (error) {
      throw error
    }
  }

  const formUpdateTestimonyRef = useRef<UpdateTestimonyFormRef>(null)

  const handleUpdateTestimonyForm = async () => {
    if (!formUpdateTestimonyRef.current) {
      throw new Error('Form ref is not available')
    }

    try {
      await formUpdateTestimonyRef.current.submit()
    } catch (error) {
      throw error
    }
  }

  const [deletedTestimonyID, setDeletedTestimonyID] = useState<number | null>(
    null,
  )
  const { mutate: deleteTestimonyData, isPending: deletingTestimony } =
    useMutation({
      mutationFn: (id: number) => deleteTestimony(id),
      onMutate: (id: number) => {
        setDeletedTestimonyID(id)
      },
      onSettled: () => {
        setDeletedTestimonyID(null)
      },
      onSuccess: async () => {
        await refetchTestimonies()
      },
    })

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col space-y-4">
        <h1 className="text-2xl font-medium">Pengaturan Profile Website</h1>

        <Carousel className="w-[400px] h-[250px] ml-12 mt-8">
          <CarouselContent className="h-full">
            {staticAssets?.map((asset) => (
              <CarouselItem
                key={asset.id}
                className="flex items-center justify-center h-full"
              >
                <img
                  src={getAsset(asset.asset_url)}
                  alt={asset.asset_name}
                  className="object-contain w-[400px] h-[250px] rounded"
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>

        <div className="flex items-center overflow-auto max-w-[500px]">
          <label
            htmlFor="upload-asset"
            className={cn(
              'flex-shrink-0 w-24 h-24 m-2 border rounded cursor-pointer flex items-center justify-center',
              uploadingAsset &&
                'opacity-50 cursor-not-allowed pointer-events-none',
            )}
            aria-disabled={uploadingAsset}
          >
            {uploadingAsset ? <Loader2 className="animate-spin" /> : <Plus />}
          </label>

          <input
            id="upload-asset"
            type="file"
            accept="image/*"
            hidden
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (file) {
                await uploadAsset(file)
              }
            }}
          />

          {staticAssets?.map((asset) => (
            <div
              key={asset.id}
              className="flex-shrink-0 w-24 h-24 m-2 border rounded cursor-pointer"
            >
              <img
                src={getAsset(asset.asset_url)}
                alt={asset.asset_name}
                className="object-cover w-full h-full rounded"
              />
            </div>
          ))}
        </div>

        <section className="flex flex-col gap-2 mt-12">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-medium">Testimoni Pengguna</h1>
            <FormSheet
              trigger={
                <Button className="flex items-center gap-2" variant="outline">
                  Tambah Testimoni
                </Button>
              }
              title="Buat Testimoni Baru"
              description="Tindakan ini akan membuat sesi pertemuan baru. Silakan isi formulir di bawah ini untuk melanjutkan."
              onSubmitForm={handleSubmitForm}
              disabled={false}
            >
              <TestimonyForm ref={formTestimonyRef} />
            </FormSheet>
          </div>

          <Table
            columns={[
              {
                header: 'Foto',
                accessorKey: 'testimoner_photo',
                cell: ({ row }) => (
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center bg-gray-100">
                    <img
                      src={getAsset(row.original.testimoner_photo ?? '')}
                      alt={row.original.testimoner_name}
                      className="w-full h-full object-cover"
                      style={{ aspectRatio: '1 / 1' }}
                    />
                  </div>
                ),
              },
              { header: 'Nama', accessorKey: 'testimoner_name' },
              {
                header: 'Posisi Terbaru',
                accessorKey: 'testimoner_current_position',
              },
              {
                header: 'Posisi Sebelumnya',
                accessorKey: 'testimoner_previous_position',
              },
              {
                header: 'Testimoni',
                accessorKey: 'testimony_text',
                cell: ({ row }) => (
                  <div className="max-w-xs truncate whitespace-pre-line line-clamp-3">
                    {row.original.testimony_text}
                  </div>
                ),
              },
              {
                header: 'Dibuat Pada',
                accessorKey: 'created_at',
                cell: ({ row }) => (
                  <div>
                    {formatDate(row.original.created_at, 'dd MMMM yyyy')}
                  </div>
                ),
              },
              {
                header: 'Aksi',
                cell: ({ row }) => (
                  <div className="flex items-center gap-2">
                    <FormSheet
                      trigger={
                        <Button variant="warning" size="icon" className="p-2">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      }
                      title="Edit Testimoni"
                      description="Silakan ubah informasi testimoni di bawah ini."
                      onSubmitForm={handleUpdateTestimonyForm}
                      disabled={false}
                    >
                      <UpdateTestimonyForm
                        ref={formUpdateTestimonyRef}
                        testimony={row.original as Testimony}
                      />
                    </FormSheet>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="p-2"
                      onClick={() => deleteTestimonyData(row.original.id)}
                      disabled={
                        deletingTestimony &&
                        deletedTestimonyID === row.original.id
                      }
                      aria-label="Hapus Testimoni"
                    >
                      {deletingTestimony &&
                      deletedTestimonyID === row.original.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ),
              },
            ]}
            data={testimonies || []}
          />
        </section>
      </div>
    </div>
  )
}
