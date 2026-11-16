import { forwardRef, useImperativeHandle } from 'react'

import { cn } from '@/shared/lib/utils'
import { useQuestionForm } from '@/features/quizzes/hooks/use-question-form'
import type {
  QuestionFormProps,
  QuestionFormRef,
} from '@/features/quizzes/types'
import { isChoiceQuestionType } from '@/features/quizzes/types'
import { QuestionTypeSelect } from './question-form/question-type-select'
import { QuestionImageField } from './question-form/question-image-field'
import { QuestionOpenEndedField } from './question-form/question-open-ended-field'
import { QuestionTextAnswersField } from './question-form/question-text-answers-field'
import { QuestionOptionsField } from './question-form/question-options-field'

export const QuestionForm = forwardRef<QuestionFormRef, QuestionFormProps>(
  ({ quizId, question, className, onSuccess }, ref) => {
    const {
      form,
      questionType,
      questionTypeError,
      imagePreview,
      imageError,
      options,
      textAnswers,
      optionsError,
      handleTypeChange,
      handleFileChange,
      clearImage,
      handleAddOption,
      handleRemoveOption,
      handleOptionTextChange,
      handleToggleCorrect,
      handleOptionImageChange,
      clearOptionImage,
      handleAddTextAnswer,
      handleRemoveTextAnswer,
      handleTextAnswerChange,
    } = useQuestionForm({ quizId, question, onSuccess })

    useImperativeHandle(ref, () => ({
      submit: async () => {
        await form.handleSubmit()
      },
    }))

    const { AppField } = form

    return (
      <form
        id={
          question
            ? `update-question-${question.id}-form`
            : 'create-question-form'
        }
        className={cn('px-4 space-y-6', className)}
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          form.handleSubmit()
        }}
      >
        {!question && (
          <QuestionTypeSelect
            value={questionType}
            onChange={handleTypeChange}
            required
            error={questionTypeError}
          />
        )}

        <AppField name="question_text">
          {({ TextArea }) => (
            <TextArea label="Teks Pertanyaan" rows={3} required />
          )}
        </AppField>

        <QuestionImageField
          imagePreview={imagePreview}
          imageError={imageError}
          onFileChange={handleFileChange}
          onClear={clearImage}
        />

        {/* IRT 2PL Item Calibration Fields */}
        <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
          <div className="text-xs font-semibold text-foreground uppercase tracking-wider">
            IRT 2PL Item Calibration
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <AppField name="discrimination">
              {({ TextField }) => (
                <TextField
                  name="discrimination"
                  type="number"
                  label="Discrimination (a)"
                  placeholder="1.0"
                />
              )}
            </AppField>

            <AppField name="difficulty">
              {({ TextField }) => (
                <TextField
                  name="difficulty"
                  type="number"
                  label="Difficulty (b)"
                  placeholder="0.0"
                />
              )}
            </AppField>

            <AppField name="calibration_version">
              {({ TextField }) => (
                <TextField
                  name="calibration_version"
                  type="text"
                  label="Calibration Version"
                  placeholder="v1.0"
                />
              )}
            </AppField>
          </div>
        </div>

        {!question && (
          <div className="space-y-4">
            {questionType === 'open_ended' && <QuestionOpenEndedField />}

            {questionType === 'fill_in_the_blank' && (
              <QuestionTextAnswersField
                answers={textAnswers}
                error={optionsError}
                onAddAnswer={handleAddTextAnswer}
                onRemoveAnswer={handleRemoveTextAnswer}
                onAnswerChange={handleTextAnswerChange}
              />
            )}

            {isChoiceQuestionType(questionType) && (
              <QuestionOptionsField
                questionType={questionType}
                options={options}
                error={optionsError}
                onAddOption={handleAddOption}
                onRemoveOption={handleRemoveOption}
                onOptionTextChange={handleOptionTextChange}
                onOptionImageChange={handleOptionImageChange}
                onClearOptionImage={clearOptionImage}
                onToggleCorrect={handleToggleCorrect}
              />
            )}
          </div>
        )}
      </form>
    )
  },
)

QuestionForm.displayName = 'QuestionForm'
