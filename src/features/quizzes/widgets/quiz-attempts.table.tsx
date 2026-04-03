import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, RotateCcw } from 'lucide-react'
import { useState } from 'react'

import type { QuizAttempt } from '@/shared/types/response'
import { resetQuizAttempt } from '@/entities/quizzes'
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
import { Table } from '@/widgets/table'

interface QuizAttemptsTableProps {
  quizId: number
  attempts: Array<QuizAttempt>
  isLoading: boolean
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
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="outline">
          {resettingUserId === attempt.user_id ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RotateCcw className="h-4 w-4" />
          )}
          Reset
        </Button>
      </AlertDialogTrigger>
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
          >
            Lanjutkan
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function QuizAttemptsTable({
  quizId,
  attempts,
  isLoading,
}: QuizAttemptsTableProps) {
  return (
    <Table
      key={`quiz-attempts-${attempts.length}`}
      columns={[
        { accessorKey: 'user_name', header: 'Nama User' },
        { accessorKey: 'user_email', header: 'Email' },
        {
          accessorKey: 'status',
          header: 'Status',
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
          cell: ({ row }) =>
            row.original.score === null ? '-' : row.original.score.toFixed(2),
        },
        {
          accessorKey: 'started_at',
          header: 'Mulai',
          cell: ({ row }) => formatDateTime(row.original.started_at),
        },
        {
          accessorKey: 'submitted_at',
          header: 'Submit',
          cell: ({ row }) => formatDateTime(row.original.submitted_at),
        },
        {
          accessorKey: 'reset_at',
          header: 'Reset',
          cell: ({ row }) => formatDateTime(row.original.reset_at),
        },
        {
          header: 'Aksi',
          cell: ({ row }) => (
            <QuizAttemptResetAction quizId={quizId} attempt={row.original} />
          ),
        },
      ]}
      data={attempts}
      isLoading={isLoading}
    />
  )
}
