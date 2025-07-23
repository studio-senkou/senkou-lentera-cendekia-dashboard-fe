import { useAppForm } from '@/hooks/form'
import { createMeetingSession } from '@/lib/meeting-sessions'
import { getMentorDropdown, getUserDropdown } from '@/lib/users'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { forwardRef, useImperativeHandle } from 'react'
import z from 'zod'

interface MeetingSessionFormProps {
  className?: string
  onSuccess?: () => void
}

export interface MeetingSessionFormRef {
  submit: () => void
}

const meetingSessionSchema = z.object({
  student_id: z.string().min(1, 'Please select a student!'),
  mentor_id: z.string().min(1, 'Please select a mentor!'),
  topic: z.string().min(1, 'Topic is required!'),
  date: z.string().refine((date) => new Date(date) > new Date(), {
    message: 'Session date must be in the future',
  }),
  time: z.string().min(1, 'Session time is required!'),
  duration: z.number().min(1, 'Session duration must be at least 1 minute!'),
  type: z.string().min(1, 'Session type is required!'),
})

export const MeetingSessionForm = forwardRef<
  MeetingSessionFormRef,
  MeetingSessionFormProps
>(({ className, onSuccess }, ref) => {
  const form = useAppForm({
    defaultValues: {
      student_id: '',
      mentor_id: '',
      topic: '',
      date: '',
      time: '',
      duration: 60, // Default to 60 minutes
      type: 'Sesi Online',
    },
    validators: {
      onSubmit: meetingSessionSchema,
    },
    onSubmit: async (values) => {
      try {
        const submitValues = {
          ...values.value,
          student_id: parseInt(values.value.student_id),
          mentor_id: parseInt(values.value.mentor_id),
        }
        await createMeetingSession(submitValues)
        form.reset()
        onSuccess?.()
      } catch (error) {
        console.error('Error submitting form:', error)
      }
    },
  })

  useImperativeHandle(ref, () => ({
    submit: () => {
      form.handleSubmit()
    },
  }))

  const { AppField } = form

  const { data: usersDropdown } = useQuery({
    queryKey: ['users-dropdown'],
    queryFn: getUserDropdown,
    select: (data) => {
      return (data.data.users as Array<{ id: string; name: string }>) ?? []
    },
  })

  const { data: mentorDropdown } = useQuery({
    queryKey: ['mentor-dropdown'],
    queryFn: getMentorDropdown,
    select: (data) => {
      return (data.data.mentors as Array<{ id: string; name: string }>) ?? []
    },
  })

  return (
    <form
      id="create-meeting-session-form"
      className={cn('px-4', className)}
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
    >
      <div className="grid gap-3">
        <AppField name="student_id">
          {({ Select }) => {
            return (
              <Select
                label="Peserta"
                placeholder="Pilih peserta sesi"
                values={
                  Array.isArray(usersDropdown)
                    ? usersDropdown.map((user) => ({
                        label: user.name,
                        value: String(user.id),
                      }))
                    : []
                }
              />
            )
          }}
        </AppField>
        <AppField name="mentor_id">
          {({ Select }) => {
            return (
              <Select
                label="Mentor"
                placeholder="Pilih mentor sesi"
                values={
                  Array.isArray(mentorDropdown)
                    ? mentorDropdown.map((mentor) => ({
                        label: mentor.name,
                        value: String(mentor.id),
                      }))
                    : []
                }
              />
            )
          }}
        </AppField>
        <AppField name="topic">
          {({ TextField }) => (
            <TextField
              type="text"
              label="Topik"
              name="session_topic"
              placeholder="Masukkan topik sesi pertemuan"
            />
          )}
        </AppField>
        <AppField name="date">
          {({ DatePicker }) => <DatePicker label="Tanggal Sesi" name="date" />}
        </AppField>
        <AppField name="time">
          {({ TimePicker }) => <TimePicker label="Waktu Sesi" name="time" />}
        </AppField>
        <AppField name="duration">
          {({ TextField }) => (
            <TextField
              type="number"
              label="Durasi Sesi"
              name="duration"
              placeholder="Masukkan durasi sesi pertemuan"
            />
          )}
        </AppField>
        <AppField name="type">
          {({ TextField }) => <TextField label="Tipe Sesi" name="type" />}
        </AppField>
      </div>
    </form>
  )
})
