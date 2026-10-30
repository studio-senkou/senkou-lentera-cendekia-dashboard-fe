import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useRef } from 'react'

import type { QuizFormRef } from '@/features/quizzes/widgets/quiz.form'
import { Button } from '@/shared/ui/button'
import { FormSheet } from '@/shared/ui/form-sheet'
import { useHeaderStore } from '@/shared/hooks/use-header'
import { useServerTable } from '@/shared/hooks/use-server-table'
import { getQuizzes } from '@/entities/quizzes'
import { QuizForm } from '@/features/quizzes/widgets/quiz.form'
import { QuizzesDataTable } from '@/features/quizzes/widgets/quizzes.data-table'
import BasePageLayout from '@/widgets/base-page-layout'

export const Route = createFileRoute('/_authenticatedLayout/quizzes/')({
  loader: () => {
    const setTitle = useHeaderStore.getState().setTitle
    setTitle('Manajemen Kuis')
  },
  component: RouteComponent,
})

function RouteComponent() {
  const formRef = useRef<QuizFormRef>(null)
  const {
    pagination,
    params,
    search,
    searchInput,
    setSearchInput,
    setPage,
    setPageSize,
  } = useServerTable()

  const { data, isLoading } = useQuery({
    queryKey: ['quizzes', pagination.currentPage, pagination.pageSize, search],
    queryFn: () => getQuizzes(params),
  })

  const quizzes = data?.quizzes ?? []

  const handleSubmitForm = async () => {
    if (!formRef.current) {
      throw new Error('Form ref is not available')
    }

    await formRef.current.submit()
  }

  return (
    <BasePageLayout subtitle="Kelola kuis, soal, pilihan jawaban, dan attempt user dari sini.">
      <div className="flex flex-col gap-4">
        <QuizzesDataTable
          quizzes={quizzes}
          isLoading={isLoading}
          pagination={pagination}
          totalItems={data?.meta?.total ?? 0}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          toolbar={
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
          }
        />
      </div>
    </BasePageLayout>
  )
}
