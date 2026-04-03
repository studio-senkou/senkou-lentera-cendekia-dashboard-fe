import { Plus } from 'lucide-react'
import { useRef } from 'react'

import type { QuestionFormRef } from '@/features/quizzes/widgets/question.form'
import { Button } from '@/shared/ui/button'
import { FormSheet } from '@/shared/ui/form-sheet'
import { QuestionForm } from '@/features/quizzes/widgets/question.form'

export interface CreateQuestionSheetProps {
  quizId: number
}

export function CreateQuestionSheet({ quizId }: CreateQuestionSheetProps) {
  const questionRef = useRef<QuestionFormRef>(null)

  const handleSubmitForm = async () => {
    if (!questionRef.current) {
      throw new Error('Form ref is not available')
    }

    await questionRef.current.submit()
  }

  return (
    <FormSheet
      trigger={
        <Button
          className="w-full max-w-96 justify-center rounded-full p-6"
          variant="default"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          Soal Baru
        </Button>
      }
      title="Buat Soal Baru"
      description="Tambahkan pertanyaan baru ke kuis ini."
      onSubmitForm={handleSubmitForm}
    >
      <QuestionForm ref={questionRef} quizId={quizId} />
    </FormSheet>
  )
}
