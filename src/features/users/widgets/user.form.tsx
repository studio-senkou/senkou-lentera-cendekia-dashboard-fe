import { forwardRef, useImperativeHandle } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import z from 'zod'

import { registerUser } from '@/entities/users'
import { useAppForm } from '@/shared/hooks/form'
import { cn } from '@/shared/lib/utils'
import { fetchClassesForDropdown } from '@/entities/classes'

interface RegisterUserFormProps {
  className?: string
  onSuccess?: () => void
}

export interface RegisterUserFormRef {
  submit: () => Promise<void>
}

const registerSchema = z.object({
  name: z.string().min(1, 'Nama diperlukan'),
  email: z
    .string()
    .email('Alamat email tidak valid')
    .min(1, 'Email diperlukan'),
  role: z.enum(['user', 'mentor']),
  minimal_sessions: z.number().min(1, {
    message: 'Sesi minimal harus lebih besar dari 0',
  }),
  classes: z.array(z.string()),
})

export const RegisterUserForm = forwardRef<
  RegisterUserFormRef,
  RegisterUserFormProps
>(({ className, onSuccess }, ref) => {
  const queryClient = useQueryClient()

  const { data: classesDropdown } = useQuery({
    queryKey: ['classes', 'dropdown'],
    queryFn: fetchClassesForDropdown,
  })

  const form = useAppForm({
    defaultValues: {
      name: '',
      email: '',
      role: 'user' as 'user' | 'mentor',
      minimal_sessions: 1,
      classes: [] as Array<string>,
    },
    validators: {
      onSubmit: registerSchema,
    },
    onSubmitInvalid: () => {
      throw new Error('Failed to submit form')
    },
    canSubmitWhenInvalid: false,
    onSubmit: async ({ value }) => {
      await registerUser({
        name: value.name,
        email: value.email,
        role: value.role,
        classes: value.classes,
        minimal_sessions: value.minimal_sessions,
      })

      await queryClient.refetchQueries({ queryKey: ['users'] })
      form.reset()
      onSuccess?.()
    },
  })

  useImperativeHandle(ref, () => ({
    submit: async () => {
      await form.handleSubmit()
    },
  }))

  const { AppField } = form

  return (
    <form
      id="register-user-form"
      className={cn('px-4', className)}
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
    >
      <div className="grid gap-3">
        <AppField name="name">
          {({ TextField }) => (
            <TextField
              name="name"
              label="Nama"
              placeholder="Masukkan nama pengguna"
              required
            />
          )}
        </AppField>
        <AppField name="email">
          {({ TextField }) => (
            <TextField
              type="email"
              name="email"
              label="Email"
              placeholder="Masukkan email pengguna"
              required
            />
          )}
        </AppField>

        <AppField name="classes">
          {({ MultiComboboxField }) => {
            let maxSelected = undefined

            switch (form.getFieldValue('role')) {
              case 'user':
                maxSelected = 1
                break
              case 'mentor':
                maxSelected = 10
                break
              default:
                maxSelected = undefined
            }

            return (
              <MultiComboboxField
                label="Kelas"
                placeholder="Pilih kelas"
                options={classesDropdown}
                maxSelected={maxSelected}
                disabled={maxSelected === undefined}
                required
              />
            )
          }}
        </AppField>

        {form.getFieldValue('role') === 'user' && (
          <AppField name="minimal_sessions">
            {({ NumberField }) => (
              <NumberField
                label="Sesi Minimal per Minggu"
                required
              />
            )}
          </AppField>
        )}

        <AppField name="role">
          {({ Select }) => (
            <Select
              label="Peran"
              placeholder="Pilih peran pengguna"
              required
              values={[
                { value: 'user', label: 'Murid' },
                { value: 'mentor', label: 'Mentor' },
              ]}
            />
          )}
        </AppField>
      </div>
    </form>
  )
})

RegisterUserForm.displayName = 'RegisterUserForm'
