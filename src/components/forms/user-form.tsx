import { useAppForm } from '@/hooks/form'
import { registerUser } from '@/lib/users'
import { cn } from '@/lib/utils'
import { useQueryClient } from '@tanstack/react-query'
import { forwardRef, useImperativeHandle } from 'react'
import z from 'zod'

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
})

export const RegisterUserForm = forwardRef<
  RegisterUserFormRef,
  RegisterUserFormProps
>(({ className, onSuccess }, ref) => {
  const queryClient = useQueryClient()

  const form = useAppForm({
    defaultValues: {
      name: '',
      email: '',
      role: 'user',
    },
    validators: {
      onSubmit: registerSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await registerUser({
          name: value.name,
          email: value.email,
          role: value.role as 'user' | 'mentor',
        })

        await queryClient.refetchQueries({ queryKey: ['users'] })
        form.reset()
        onSuccess?.()
      } catch (error) {
        throw error
      }
    },
  })

  useImperativeHandle(ref, () => ({
    submit: async () => {
      try {
        await form.handleSubmit()
      } catch (error) {
        throw error
      }
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
          {({ TextField }) => <TextField name="name" label="Nama" required />}
        </AppField>
        <AppField name="email">
          {({ TextField }) => (
            <TextField type="email" name="email" label="Email" required />
          )}
        </AppField>
        <AppField name="role">
          {({ Select }) => (
            <Select
              label="Peran"
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
