import { FormSheet } from '@/shared/ui/form-sheet'
import {
  TestimonyForm,
  type TestimonyFormRef,
} from '@/features/testimony/widgets/testimony.form'
import {
  UpdateTestimonyForm,
  type UpdateTestimonyFormRef,
} from '@/features/testimony/widgets/update-testimony.form'
import { RowActions, Table } from '@/widgets/table'
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
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/shared/ui/carousel'
import { useHeaderStore } from '@/shared/hooks/use-header'
import { useServerTable } from '@/shared/hooks/use-server-table'
import BasePageLayout from '@/widgets/base-page-layout'
import {
  deleteStaticAsset,
  getAllStaticAssets,
  storeNewAsset,
} from '@/entities/static-assets'
import { deleteTestimony, getAllTestimonies } from '@/entities/testimony'
import { cn } from '@/shared/lib/utils'
import type { StaticAsset, Testimony } from '@/shared/types/response'
import { getAsset } from '@/shared/utils/assets'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { formatDate } from 'date-fns'
import { Edit2, Loader2, Plus, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'

export const Route = createFileRoute('/_authenticatedLayout/page-settings/')({
  loader: () => {
    const setTitle = useHeaderStore.getState().setTitle
    setTitle('Pengaturan Profil Website')
  },
  component: RouteComponent,
})

function TestimonyRowActions({
  testimony,
  isDeleting,
  deletingId,
  onDelete,
  onSubmitUpdate,
  updateFormRef,
}: {
  testimony: Testimony
  isDeleting: boolean
  deletingId: number | null
  onDelete: (id: number) => void
  onSubmitUpdate: () => Promise<void>
  updateFormRef: { current: UpdateTestimonyFormRef | null }
}) {
  const [editOpen, setEditOpen] = useState(false)

  return (
    <>
      <RowActions
        actions={[
          {
            key: 'edit',
            node: null,
            alwaysOverflow: true,
            overflow: {
              icon: <Edit2 className="h-4 w-4" />,
              label: 'Edit Testimoni',
              onSelect: () => setEditOpen(true),
            },
          },
          {
            key: 'delete',
            node: null,
            alwaysOverflow: true,
            overflow: {
              icon:
                isDeleting && deletingId === testimony.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                ),
              label: 'Hapus Testimoni',
              variant: 'destructive',
              onSelect: () => onDelete(testimony.id),
            },
          },
        ]}
      />

      <FormSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        title="Edit Testimoni"
        description="Silakan ubah informasi testimoni di bawah ini."
        onSubmitForm={onSubmitUpdate}
        disabled={false}
      >
        <UpdateTestimonyForm ref={updateFormRef} testimony={testimony} />
      </FormSheet>
    </>
  )
}

function RouteComponent() {
  const {
    pagination,
    params,
    search,
    searchInput,
    setSearchInput,
    setPage,
    setPageSize,
  } = useServerTable()

  const { data: staticAssets, refetch: refetchStaticAssets } = useQuery<
    StaticAsset[]
  >({
    queryKey: ['page-static-assets'],
    queryFn: getAllStaticAssets,
    staleTime: 1000 * 60 * 5,
  })

  const {
    data: testimonyData,
    refetch: refetchTestimonies,
    isLoading: loadingTestimonies,
  } = useQuery({
    queryKey: [
      'testimonies',
      pagination.currentPage,
      pagination.pageSize,
      search,
    ],
    queryFn: () => getAllTestimonies(params),
    staleTime: 1000 * 60 * 5,
  })

  const testimonies = testimonyData?.testimonials ?? []

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

    await formTestimonyRef.current.submit()
  }

  const formUpdateTestimonyRef = useRef<UpdateTestimonyFormRef>(null)

  const handleUpdateTestimonyForm = async () => {
    if (!formUpdateTestimonyRef.current) {
      throw new Error('Form ref is not available')
    }

    await formUpdateTestimonyRef.current.submit()
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

  const { mutate: deleteStaticAssetData, isPending: deletingStaticAsset } =
    useMutation({
      mutationFn: (assetID: number) => deleteStaticAsset(assetID),
      onSuccess: async () => {
        await refetchStaticAssets()
      },
      onError: (error) => {
        console.error('Failed to delete asset:', error)
      },
    })

  return (
    <BasePageLayout subtitle="Atur profil, aset gambar, dan testimoni yang tampil di website.">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col space-y-4">
          <Carousel className="w-[400px] h-[250px] ml-12">
            <CarouselContent className="h-full">
              {!staticAssets || staticAssets.length === 0 ? (
                <CarouselItem className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center justify-center w-full h-full bg-gray-100 rounded p-8">
                    <div className="text-gray-500 font-medium">
                      Belum ada gambar
                    </div>
                    <div className="text-gray-400 text-sm">
                      Silakan upload gambar untuk ditampilkan di sini.
                    </div>
                  </div>
                </CarouselItem>
              ) : (
                staticAssets.map((asset) => (
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
                ))
              )}
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
                className="flex-shrink-0 w-24 h-24 m-2 border rounded cursor-pointer relative flex items-center justify-center overflow-hidden"
              >
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="relative min-w-full h-full p-0 group"
                    >
                      <img
                        src={getAsset(asset.asset_url)}
                        alt={asset.asset_name}
                        className="w-full h-full object-cover rounded transition-all group-hover:brightness-75"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                      <Trash2 className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <div className="flex flex-col items-center">
                      <img
                        src={getAsset(asset.asset_url)}
                        alt={asset.asset_name}
                        className="object-contain w-full h-64 rounded mb-4"
                        style={{ maxHeight: '16rem', maxWidth: '100%' }}
                      />
                      <AlertDialogHeader>
                        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tindakan ini tidak dapat dibatalkan. Gambar akan
                          dihapus secara permanen dari server kami.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          deleteStaticAssetData(asset.id)
                        }}
                      >
                        {deletingStaticAsset && (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                        Yes, Delete it
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>

          <section className="flex flex-col gap-2 mt-12">
            <h1 className="text-2xl font-medium">Testimoni Pengguna</h1>

            <Table
              columns={[
                {
                  header: 'Foto',
                  accessorKey: 'testimoner_photo',
                  meta: { minWidth: '5rem' },
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
                {
                  header: 'Nama',
                  accessorKey: 'testimoner_name',
                  meta: { minWidth: '12rem' },
                },
                {
                  header: 'Posisi Terbaru',
                  accessorKey: 'testimoner_current_position',
                  meta: { minWidth: '12rem' },
                },
                {
                  header: 'Posisi Sebelumnya',
                  accessorKey: 'testimoner_previous_position',
                  meta: { minWidth: '12rem' },
                },
                {
                  header: 'Testimoni',
                  accessorKey: 'testimony_text',
                  meta: { minWidth: '18rem' },
                  cell: ({ row }) => (
                    <div className="max-w-xs truncate whitespace-pre-line line-clamp-3">
                      {row.original.testimony_text}
                    </div>
                  ),
                },
                {
                  header: 'Dibuat Pada',
                  accessorKey: 'created_at',
                  meta: { minWidth: '9rem' },
                  cell: ({ row }) => (
                    <div>
                      {formatDate(row.original.created_at, 'dd MMMM yyyy')}
                    </div>
                  ),
                },
                {
                  header: 'Aksi',
                  meta: { fixed: 'right' },
                  cell: ({ row }) => (
                    <TestimonyRowActions
                      testimony={row.original as Testimony}
                      isDeleting={deletingTestimony}
                      deletingId={deletedTestimonyID}
                      onDelete={deleteTestimonyData}
                      onSubmitUpdate={handleUpdateTestimonyForm}
                      updateFormRef={formUpdateTestimonyRef}
                    />
                  ),
                },
              ]}
              data={testimonies}
              isLoading={loadingTestimonies}
              pagination={pagination}
              totalItems={testimonyData?.meta?.total ?? 0}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              searchValue={searchInput}
              onSearchChange={setSearchInput}
              toolbar={
                <FormSheet
                  trigger={
                    <Button
                      className="flex items-center gap-2"
                      variant="outline"
                    >
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
              }
            />
          </section>
        </div>
      </div>
    </BasePageLayout>
  )
}
