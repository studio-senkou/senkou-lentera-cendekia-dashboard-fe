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
  submit: () => void
}

const registerSchema = z.object({
  name: z.string().min(1, 'Nama diperlukan'),
  email: z
    .string()
    .email('Alamat email tidak valid')
    .min(1, 'Email diperlukan'),
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
    },
    validators: {
      onSubmit: registerSchema,
    },
    onSubmit: async (values) => {
      try {
        await registerUser({
          name: values.value.name,
          email: values.value.email,
        })

        queryClient.refetchQueries({ queryKey: ['users'] })

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
        <form.AppField name="name">
          {(field) => <field.TextField name="name" label="Nama" />}
        </form.AppField>
        <form.AppField name="email">
          {(field) => (
            <field.TextField type="email" name="email" label="Email" />
          )}
        </form.AppField>
        {/* <form.AppField name="password">
          {(field) => (
            <field.TextField name="password" label="Password" type="password" />
          )}
        </form.AppField>
        <form.AppField name="confirmPassword">
          {(field) => (
            <field.TextField
              name="confirmPassword"
              label="Konfirmasi Password"
              type="password"
            />
          )}
        </form.AppField> */}
      </div>
    </form>
  )
})

RegisterUserForm.displayName = 'RegisterUserForm'
