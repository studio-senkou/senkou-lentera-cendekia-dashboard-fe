import { useAppForm } from '@/hooks/form'
import { updateMeetingSession } from '@/lib/meeting-sessions'
import { cn } from '@/lib/utils'
import type { MeetingSession } from '@/types/response'
import { useQueryClient } from '@tanstack/react-query'
import { forwardRef, useImperativeHandle } from 'react'
import z from 'zod'

export interface UpdateMeetingSessionFormProps {
  session: MeetingSession
  className?: string
  onSuccess?: () => void
}

export interface UpdateMeetingSessionFormRef {
  submit: () => Promise<void>
}

const updateMeetingSessionSchema = z.object({
  topic: z.string().min(1, 'Topic is required!'),
  date: z
    .string()
    .min(1, 'Session date is required!')
    .refine(
      (val) => {
        const date = new Date(val)
        return !isNaN(date.getTime()) && date > new Date()
      },
      { message: 'Session date must be in the future' },
    ),
  time: z.string().min(1, 'Session time is required!'),
  duration: z.number().min(1, 'Session duration must be at least 1 minute!'),
  type: z.string().min(1, 'Session type is required!'),
  description: z.string().refine(
    (val) => {
      if (val.trim() === '') return true
      return val.trim().length >= 3
    },
    { message: 'Description must be at least 3 characters if provided' },
  ),
})

export const UpdateMeetingSessionForm = forwardRef<
  UpdateMeetingSessionFormRef,
  UpdateMeetingSessionFormProps
>(({ session, className, onSuccess }, ref) => {
  const queryClient = useQueryClient()

  const form = useAppForm({
    defaultValues: {
      topic: session.session_topic,
      date: session.session_date
        ? new Date(session.session_date).toISOString().slice(0, 10)
        : '',
      time: session.session_time
        ? new Date(session.session_time).toISOString().slice(11, 16)
        : '',
      duration: session.session_duration,
      type: session.session_type,
      description: session.session_description ?? '',
    },
    validators: {
      onSubmit: updateMeetingSessionSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const submitData = {
          ...value,
          description:
            value.description && value.description.trim() !== ''
              ? value.description.trim()
              : undefined,
        }

        await updateMeetingSession({
          id: session.id,
          data: submitData,
        })

        await queryClient.refetchQueries({ queryKey: ['meeting-sessions'] })
        form.reset()
        onSuccess?.()
      } catch (error) {
        throw error
      }
    },
  })

  useImperativeHandle(ref, () => ({
    submit: async () => {
      return new Promise<void>((resolve, reject) => {
        form.validateAllFields('submit').then((hasErrors) => {
          if (hasErrors && hasErrors.length > 0) {
            reject(new Error('Form has validation errors'))
            return
          }

          form
            .handleSubmit()
            .then(() => resolve())
            .catch((error) => reject(error))
        })
      })
    },
  }))

  const { AppField } = form

  return (
    <form
      id="update-meeting-session-form"
      className={cn('px-4', className)}
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
    >
      <div className="flex flex-col gap-4">
        <AppField name="topic">
          {({ TextField }) => (
            <TextField label="Topik Sesi" required name="topic" />
          )}
        </AppField>
        <AppField name="date">
          {({ DatePicker }) => (
            <DatePicker label="Tanggal Sesi" required name="date" />
          )}
        </AppField>
        <AppField name="time">
          {({ TimePicker }) => (
            <TimePicker label="Waktu Sesi" required name="time" />
          )}
        </AppField>
        <AppField name="duration">
          {({ TextField }) => (
            <TextField
              type="number"
              label="Durasi Sesi"
              required
              name="duration"
              placeholder="Masukkan durasi sesi pertemuan"
            />
          )}
        </AppField>
        <AppField name="type">
          {({ TextField }) => (
            <TextField label="Tipe Sesi" required name="type" />
          )}
        </AppField>
        <AppField name="description">
          {({ TextArea }) => <TextArea label="Deskripsi" />}
        </AppField>
      </div>
    </form>
  )
})

UpdateMeetingSessionForm.displayName = 'UpdateMeetingSessionForm'
