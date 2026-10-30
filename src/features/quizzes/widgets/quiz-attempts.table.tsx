import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import type { ReactNode } from 'react'

import type { QuizAttempt } from '@/shared/types/response'
import { resetQuizAttempt } from '@/entities/quizzes'
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
import { RowActions, Table } from '@/widgets/table'

interface QuizAttemptsTableProps {
  quizId: number
  attempts: Array<QuizAttempt>
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

function formatDateTime(value: string | null) {
  if (!value) return '-'
  return new Date(value).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function QuizAttemptResetAction({
  quizId,
  attempt,
}: {
  quizId: number
  attempt: QuizAttempt
}) {
  const queryClient = useQueryClient()
  const [resettingUserId, setResettingUserId] = useState<number | null>(null)
  const [resetOpen, setResetOpen] = useState(false)

  const { mutateAsync: resetAttemptMutation } = useMutation({
    mutationFn: (userId: number) => resetQuizAttempt(quizId, userId),
    onMutate: (userId: number) => {
      setResettingUserId(userId)
    },
    onSettled: () => {
      setResettingUserId(null)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['quiz', quizId] })
      await queryClient.invalidateQueries({
        queryKey: ['quiz', quizId, 'attempts'],
      })
    },
  })

  if (attempt.status === 'reset') {
    return <span className="text-xs text-muted-foreground">Sudah di-reset</span>
  }

  return (
    <>
      <RowActions
        actions={[
          {
            key: 'reset',
            node: null,
            alwaysOverflow: true,
            overflow: {
              icon: <RotateCcw className="h-4 w-4" />,
              label: 'Reset attempt',
              variant: 'destructive',
              onSelect: () => setResetOpen(true),
            },
          },
        ]}
      />

      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset attempt user ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Attempt lama tetap tersimpan sebagai audit dan user bisa mengulang
              kuis dari awal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => resetAttemptMutation(attempt.user_id)}
              disabled={resettingUserId === attempt.user_id}
            >
              {resettingUserId === attempt.user_id && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function QuizAttemptsTable({
  quizId,
  attempts,
  isLoading,
  pagination,
  totalItems,
  onPageChange,
  onPageSizeChange,
  searchValue,
  onSearchChange,
  toolbar,
}: QuizAttemptsTableProps) {
  return (
    <Table
      key={`quiz-attempts-${attempts.length}`}
      columns={[
        {
          accessorKey: 'user_name',
          header: 'Nama User',
          meta: { minWidth: '12rem' },
        },
        {
          accessorKey: 'user_email',
          header: 'Email',
          meta: { minWidth: '16rem' },
        },
        {
          accessorKey: 'status',
          header: 'Status',
          meta: { minWidth: '7rem' },
          cell: ({ row }) => (
            <span
              className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${row.original.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : row.original.status === 'in_progress' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}
            >
              {row.original.status}
            </span>
          ),
        },
        {
          accessorKey: 'score',
          header: 'Score',
          meta: { minWidth: '6rem' },
          cell: ({ row }) =>
            row.original.score === null ? '-' : row.original.score.toFixed(2),
        },
        {
          accessorKey: 'started_at',
          header: 'Mulai',
          meta: { minWidth: '10rem' },
          cell: ({ row }) => formatDateTime(row.original.started_at),
        },
        {
          accessorKey: 'submitted_at',
          header: 'Submit',
          meta: { minWidth: '10rem' },
          cell: ({ row }) => formatDateTime(row.original.submitted_at),
        },
        {
          accessorKey: 'reset_at',
          header: 'Reset',
          meta: { minWidth: '10rem' },
          cell: ({ row }) => formatDateTime(row.original.reset_at),
        },
        {
          header: 'Aksi',
          meta: { fixed: 'right' },
          cell: ({ row }) => (
            <QuizAttemptResetAction quizId={quizId} attempt={row.original} />
          ),
        },
      ]}
      data={attempts}
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
