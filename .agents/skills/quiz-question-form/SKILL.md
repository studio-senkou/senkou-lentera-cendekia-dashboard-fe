---
name: quiz-question-form
description: Use when creating, editing, or reviewing the quiz question form in this repo — question form architecture, feature hooks, option draft handling, question-type validation, image uploads, drawer sizing, and shared form-field conventions. Triggers on "question form", "quiz question", "question type", "buat soal", "edit soal", "question options", "question payload".
---

# Quiz Question Form

How the quiz question form is built in this repo. Architecture rules come from
`react-bulletproof`, component rules from `react-expert`, and type rules from
`typescript-oop`. Read those skills for the general rules; this file records how
they apply to the question component.

## File map

| Layer            | File                                                                                                                     | Responsibility                                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Component        | `src/features/quizzes/widgets/question.form.tsx`                                                                         | Renders the form only. Must stay thin: destructure the hook, wire fields, forward `submit` through `useImperativeHandle`. |
| Feature hook     | `src/features/quizzes/hooks/use-question-form.ts`                                                                        | All form state, field handlers, image uploads, submit flow, query invalidation, draft reset.                              |
| Pure helpers     | `src/features/quizzes/utils/question-payload.ts`                                                                         | Draft option operations, validation, answer/image payload building. No React.                                             |
| Types            | `src/features/quizzes/types/index.ts`                                                                                    | Re-exports `question-form.ts` and `question-type.ts`. Import from `@/features/quizzes/types`.                             |
| Field components | `src/features/quizzes/widgets/question-form/*`                                                                           | One presentational field per file.                                                                                        |
| Drawers          | `src/features/quizzes/widgets/quiz-detail/create-question-sheet.tsx`, `quiz-question-card.tsx`, `quiz-question-pane.tsx` | Question drawers use `DrawerSize.XXL`.                                                                                    |

## Rules

1. **Component renders, hook owns logic.** Do not add `useState`, event handlers,
   payload building, or query invalidation back into `question.form.tsx`. Add them
   to `useQuestionForm` instead.
2. **Pure operations go to `utils/question-payload.ts`.** Option add/remove/toggle,
   draft normalization, answer validation, and payload mapping are pure functions.
   Return `QuestionDraftResult<T>` (`{ ok: true, value } | { ok: false, message }`)
   instead of throwing from the helper.
3. **One field component per file**, kebab-case, named after the file. Reuse
   `FormField` from `@/shared/ui/form-field` for label, `required` asterisk, and
   error rendering.
4. **Question type is required.** For creation, `questionType` starts as `''`
   (`QuestionTypeValue`). `QuestionTypeSelect` gets `required` and the
   `questionTypeError` message. On submit, reject an empty type before building
   the payload.
5. **Editing infers the type.** Never default an existing question to
   `multiple_choice`. Use `inferQuestionType(question.options)`:
   no options → `open_ended`, more than one correct → `checkbox`, one correct →
   `multiple_choice`, otherwise → `poll`.
6. **Use the literal unions.** `QuestionType`, `ChoiceQuestionType`,
   `QuestionTypeValue`, and `isChoiceQuestionType` live in
   `types/question-type.ts`. Do not widen them to `string`.
7. **Drawers.** Question create/edit sheets use `DrawerSize.XXL` because the
   options/answers editors need width.
8. **Types are grouped, not duplicated.** `QuestionFormProps`,
   `QuestionFormOptions`, and `QuestionFormRef` live in
   `types/question-form.ts`. Callers import the ref type from
   `@/features/quizzes/types`.
9. **Images.** Validate against `MAX_IMAGE_SIZE_BYTES` (2 MB). Revoke old blob
   URLs before replacing or clearing a preview. An option needs text or an image,
   never both when one is already uploaded. In `OptionForm`, `option_text` is
   only required when no image is present; validate the pair on submit.
10. **Query state.** The form must invalidate `['quiz', quizId]`,
    `['quiz', quizId, 'questions']`, and `['quizzes']` after a successful save.

## Payload rules

`buildChoiceAnswers` and `buildTextAnswers` own these rules:

- An option counts as filled when it has trimmed text **or** an uploaded image.
  Text is optional when an image exists, and the image is optional when text
  exists; one of the two must be present.
- At least 2 filled options for choice questions.
- `multiple_choice`: exactly one correct answer.
- `checkbox`: at least one correct answer.
- `poll`: every answer is forced to `is_correct: false`.
- Text answers are trimmed; empty entries are dropped; at least one must remain.
- Option images are appended to `answerImages`, and each answer receives its
  `image_index`. An image-only option is sent with `option_text: ''`.

## Tests

Pure helpers and type inference are covered by
`src/features/quizzes/test/question-payload.test.ts`. Follow
`vitest-conventions`: `describe` in plain words, `it('Must <behavior> when
<condition>')`, import through `@/`.

Run:

```bash
bunx tsc --noEmit
bunx oxlint src/features/quizzes
bunx vitest run src/features/quizzes/test/question-payload.test.ts
```

## Checklist

- [ ] Component has no business logic beyond rendering and ref forwarding
- [ ] New state/handler lives in the feature hook
- [ ] New pure logic lives in `utils/question-payload.ts` and has a test
- [ ] Question type is required and validates on submit
- [ ] Edit mode infers the type from existing options
- [ ] Field uses `FormField` with `required` and `error`
- [ ] Question drawer uses `DrawerSize.XXL`
- [ ] Types imported from `@/features/quizzes/types`
- [ ] `tsc`, `oxlint`, and the question tests pass
