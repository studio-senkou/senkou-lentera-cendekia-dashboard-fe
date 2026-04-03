import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useRef } from 'react'

import type { QuizFormRef } from '@/features/quizzes/widgets/quiz.form'
import { Button } from '@/shared/ui/button'
import { FormSheet } from '@/shared/ui/form-sheet'
import { useHeaderStore } from '@/shared/hooks/use-header'
import { getQuizzes } from '@/entities/quizzes'
import { QuizForm } from '@/features/quizzes/widgets/quiz.form'
import { QuizzesDataTable } from '@/features/quizzes/widgets/quizzes.data-table'

export const Route = createFileRoute('/_authenticatedLayout/quizzes/')({
  loader: () => {
    const setTitle = useHeaderStore.getState().setTitle
    setTitle('Manajemen Kuis')
  },
  component: RouteComponent,
})

function RouteComponent() {
  const formRef = useRef<QuizFormRef>(null)

  const { data: quizzes, isLoading } = useQuery({
    queryKey: ['quizzes'],
    queryFn: getQuizzes,
  })

  const handleSubmitForm = async () => {
    if (!formRef.current) {
      throw new Error('Form ref is not available')
    }

    await formRef.current.submit()
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-4">
        <QuizPageHeader />
        <FormSheet
          trigger={
            <Button>
              <Plus className="h-4 w-4" />
              Kuis Baru
            </Button>
          }
          title="Buat Kuis Baru"
          description="Buat kuis dalam mode draft lalu lengkapi soal dan pilihan sebelum diaktifkan."
          onSubmitForm={handleSubmitForm}
        >
          <QuizForm ref={formRef} />
        </FormSheet>
      </div>

      <QuizzesDataTable quizzes={quizzes ?? []} isLoading={isLoading} />
    </div>
  )
}

function QuizPageHeader() {
  return (
    <div className="space-y-1">
      <h1 className="text-xl font-medium">Daftar Kuis</h1>
      <p className="text-sm text-muted-foreground">
        Kelola kuis, soal, pilihan jawaban, dan attempt user dari sini.
      </p>
    </div>
  )
}
