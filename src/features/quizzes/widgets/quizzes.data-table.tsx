import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Check, Copy, Edit2, Eye, Loader2, QrCode, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { format } from 'date-fns'
import QRCode from 'react-qr-code'
import { toast } from 'sonner'

import { QuizForm } from './quiz.form'
import type { Quiz } from '@/shared/types/response'
import type { QuizFormRef } from './quiz.form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'

import { deleteQuiz } from '@/entities/quizzes'
import { Button } from '@/shared/ui/button'
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
import { FormSheet } from '@/shared/ui/form-sheet'
import { RowActions, Table } from '@/widgets/table'

interface QuizzesDataTableProps {
  quizzes: Array<Quiz>
  isLoading: boolean
  pagination?: {
    currentPage: number
    pageSize: number
  }
  totalItems?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  searchValue?: string
  onSearchChange?: (value: string) => void
  toolbar?: ReactNode
}

function QuizActions({ quiz }: { quiz: Quiz }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [deletingQuizId, setDeletingQuizId] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const formRef = useRef<QuizFormRef>(null)

  const quizUrl = `https://portal.lbblenteracendekia.com/quiz/code/${quiz.code}`
  const whatsappMessage = `Ayo kerjakan kuis *${quiz.title}* di Lentera Cendekia!\n\nKlik tautan berikut untuk mulai:\n${quizUrl}\n\nAtau masukkan kode kuis: *${quiz.code}*`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(whatsappMessage)
      setCopied(true)
      toast.success('Pesan WhatsApp berhasil disalin!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Gagal menyalin pesan')
    }
  }

  const { mutateAsync: removeQuiz } = useMutation({
    mutationFn: (quizId: number) => deleteQuiz(quizId),
    onMutate: (quizId: number) => {
      setDeletingQuizId(quizId)
    },
    onSettled: () => {
      setDeletingQuizId(null)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['quizzes'] })
    },
  })

  const handleSubmitForm = async () => {
    if (!formRef.current) {
      throw new Error('Form ref is not available')
    }

    await formRef.current.submit()
  }

  const openQuiz = () =>
    navigate({
      to: '/quizzes/$quizId',
      params: { quizId: String(quiz.id) },
    })

  return (
    <>
      <RowActions
        actions={[
          {
            key: 'view',
            node: (
              <Button
                size="icon"
                variant="outline"
                aria-label="Lihat Kuis"
                onClick={openQuiz}
              >
                <Eye className="h-4 w-4" />
              </Button>
            ),
            overflow: {
              icon: <Eye className="h-4 w-4" />,
              label: 'Lihat Kuis',
              onSelect: openQuiz,
            },
          },
          {
            key: 'share',
            node: null,
            alwaysOverflow: true,
            overflow: {
              icon: <QrCode className="h-4 w-4" />,
              label: 'Bagikan Kuis',
              onSelect: () => setShareOpen(true),
            },
          },
          {
            key: 'edit',
            node: null,
            alwaysOverflow: true,
            overflow: {
              icon: <Edit2 className="h-4 w-4" />,
              label: 'Edit Kuis',
              onSelect: () => setEditOpen(true),
            },
          },
          {
            key: 'delete',
            node: null,
            alwaysOverflow: true,
            overflow: {
              icon: <Trash2 className="h-4 w-4" />,
              label: 'Hapus Kuis',
              variant: 'destructive',
              onSelect: () => setDeleteOpen(true),
            },
          },
        ]}
      />

      <FormSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        title="Edit Kuis"
        description="Perbarui detail kuis berikut sebelum dipublikasikan."
        onSubmitForm={handleSubmitForm}
      >
        <QuizForm ref={formRef} quiz={quiz} />
      </FormSheet>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus kuis ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus kuis secara soft delete. Soal,
              pilihan, dan attempt tetap disimpan untuk audit.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => removeQuiz(quiz.id)}
              disabled={deletingQuizId === quiz.id}
            >
              {deletingQuizId === quiz.id && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bagikan Kuis</DialogTitle>
            <DialogDescription>
              Pindai QR Code di bawah atau salin pesan untuk dibagikan via
              WhatsApp.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center space-y-6 py-4">
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <QRCode value={quizUrl} size={200} level="H" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-900">Kode Kuis</p>
              <p className="text-2xl font-bold tracking-widest text-[#FF5C06]">
                {quiz.code}
              </p>
            </div>
          </div>
          <div className="flex justify-center pb-2">
            <Button
              onClick={copyToClipboard}
              className="w-full sm:w-auto"
              variant="outline"
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4 text-green-600" />
                  <span className="text-green-600">Berhasil Disalin!</span>
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Salin Pesan WhatsApp
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function QuizzesDataTable({
  quizzes,
  isLoading,
  pagination,
  totalItems,
  onPageChange,
  onPageSizeChange,
  searchValue,
  onSearchChange,
  toolbar,
}: QuizzesDataTableProps) {
  return (
    <Table
      key={`quiz-table-${quizzes.length}`}
      columns={[
        {
          accessorKey: 'title',
          header: 'Judul',
          meta: { minWidth: '14rem' },
        },
        {
          accessorKey: 'code',
          header: 'Kode',
          meta: { minWidth: '7rem' },
        },
        {
          accessorKey: 'description',
          header: 'Deskripsi',
          meta: { minWidth: '20rem' },
        },
        {
          accessorKey: 'passing_score',
          header: 'Passing Score',
          meta: { minWidth: '8rem' },
        },
        {
          accessorKey: 'time_limit_minutes',
          header: 'Batas Waktu',
          meta: { minWidth: '8rem' },
          cell: ({ row }) =>
            row.original.time_limit_minutes
              ? `${row.original.time_limit_minutes} menit`
              : 'Tanpa batas',
        },
        {
          accessorKey: 'is_active',
          header: 'Status',
          meta: { minWidth: '7rem' },
          cell: ({ row }) => (
            <span
              className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${row.original.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}
            >
              {row.original.is_active ? 'Aktif' : 'Draft'}
            </span>
          ),
        },
        {
          accessorKey: 'created_at',
          header: 'Dibuat Pada',
          meta: { minWidth: '9rem' },
          cell: ({ row }) =>
            format(new Date(row.original.created_at), 'dd MMM yyyy'),
        },
        {
          header: 'Aksi',
          meta: { fixed: 'right' },
          cell: ({ row }) => <QuizActions quiz={row.original} />,
        },
      ]}
      data={quizzes}
      isLoading={isLoading}
      pagination={pagination}
      totalItems={totalItems}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      toolbar={toolbar}
    />
  )
}
