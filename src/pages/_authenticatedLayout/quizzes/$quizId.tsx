import { createFileRoute } from '@tanstack/react-router'

import { useHeaderStore } from '@/shared/hooks/use-header'
import { QuizDetailPage } from '@/features/quizzes/widgets/quiz-detail'
import BasePageLayout from '@/widgets/base-page-layout'

export const Route = createFileRoute('/_authenticatedLayout/quizzes/$quizId')({
  loader: () => {
    const setTitle = useHeaderStore.getState().setTitle
    setTitle('Detail Kuis')
  },
  component: RouteComponent,
})
function RouteComponent() {
  return (
    <BasePageLayout subtitle="Kelola metadata kuis, soal, pilihan jawaban, dan attempt user.">
      <QuizDetailPage />
    </BasePageLayout>
  )
}
