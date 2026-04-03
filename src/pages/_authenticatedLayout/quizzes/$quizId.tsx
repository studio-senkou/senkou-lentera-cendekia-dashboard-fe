import { createFileRoute } from '@tanstack/react-router'

import { useHeaderStore } from '@/shared/hooks/use-header'
import { QuizDetailPage } from '@/features/quizzes/widgets/quiz-detail'

export const Route = createFileRoute('/_authenticatedLayout/quizzes/$quizId')({
  loader: () => {
    const setTitle = useHeaderStore.getState().setTitle
    setTitle('Detail Kuis')
  },
  component: RouteComponent,
})
function RouteComponent() {
  return <QuizDetailPage />
}
