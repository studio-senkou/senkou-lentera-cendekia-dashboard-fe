import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Edit2, Eye, Loader2, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { format } from 'date-fns'
import QRCode from 'react-qr-code'
import { toast } from 'sonner'
import { QrCode, Copy, Check } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'

import type { Quiz } from '@/shared/types/response'
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
  AlertDialogTrigger,
} from '@/shared/ui/alert-dialog'
import { FormSheet } from '@/shared/ui/form-sheet'
import { Table } from '@/widgets/table'
import { QuizForm, type QuizFormRef } from './quiz.form'

interface QuizzesDataTableProps {
  quizzes: Array<Quiz>
  isLoading: boolean
}

function QuizActions({ quiz }: { quiz: Quiz }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [deletingQuizId, setDeletingQuizId] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const formRef = useRef<QuizFormRef>(null)

  const quizUrl = `https://portal.lbblenteracendekia.com/quiz/code/${quiz.code}`
  const whatsappMessage = `Ayo kerjakan kuis *${quiz.title}* di Lentera Cendekia!\n\nKlik tautan berikut untuk mulai:\n${quizUrl}\n\nAtau masukkan kode kuis: *${quiz.code}*`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(whatsappMessage)
      setCopied(true)
      toast.success('Pesan WhatsApp berhasil disalin!')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
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

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        size="icon"
        variant="outline"
        onClick={() =>
          navigate({
            to: '/quizzes/$quizId',
            params: { quizId: String(quiz.id) },
          })
        }
      >
        <Eye className="h-4 w-4" />
      </Button>

      <Dialog>
        <DialogTrigger asChild>
          <Button size="icon" variant="outline" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
            <QrCode className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bagikan Kuis</DialogTitle>
            <DialogDescription>
              Pindai QR Code di bawah atau salin pesan untuk dibagikan via WhatsApp.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center space-y-6 py-4">
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <QRCode value={quizUrl} size={200} level="H" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-900">Kode Kuis</p>
              <p className="text-2xl font-bold tracking-widest text-[#FF5C06]">{quiz.code}</p>
            </div>
          </div>
          <div className="flex justify-center pb-2">
            <Button onClick={copyToClipboard} className="w-full sm:w-auto" variant="outline">
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

      <FormSheet
        trigger={
          <Button size="icon" variant="warning">
            <Edit2 className="h-4 w-4" />
          </Button>
        }
        title="Edit Kuis"
        description="Perbarui detail kuis berikut sebelum dipublikasikan."
        onSubmitForm={handleSubmitForm}
      >
        <QuizForm ref={formRef} quiz={quiz} />
      </FormSheet>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="icon" variant="destructive">
            {deletingQuizId === quiz.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </AlertDialogTrigger>
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
            <AlertDialogAction onClick={() => removeQuiz(quiz.id)}>
              Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export function QuizzesDataTable({
  quizzes,
  isLoading,
}: QuizzesDataTableProps) {
  return (
    <Table
      key={`quiz-table-${quizzes.length}`}
      columns={[
        { accessorKey: 'title', header: 'Judul' },
        {
          accessorKey: 'code',
          header: 'Kode',
        },
        {
          accessorKey: 'description',
          header: 'Deskripsi',
        },
        {
          accessorKey: 'passing_score',
          header: 'Passing Score',
        },
        {
          accessorKey: 'time_limit_minutes',
          header: 'Batas Waktu',
          cell: ({ row }) =>
            row.original.time_limit_minutes
              ? `${row.original.time_limit_minutes} menit`
              : 'Tanpa batas',
        },
        {
          accessorKey: 'is_active',
          header: 'Status',
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
          cell: ({ row }) =>
            format(new Date(row.original.created_at), 'dd MMM yyyy'),
        },
        {
          header: 'Aksi',
          cell: ({ row }) => <QuizActions quiz={row.original as Quiz} />,
        },
      ]}
      data={quizzes}
      isLoading={isLoading}
    />
  )
}
