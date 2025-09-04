import { forwardRef, useImperativeHandle } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import z from 'zod'
import { useAppForm } from '@/shared/hooks/form'

export interface UpdateUserFormProps {
  className?: string
  onSuccess?: () => void
}

export interface UpdateUserFormRef {
  submit: () => Promise<void>
}

export const UpdateUserForm = forwardRef<
  UpdateUserFormRef,
  UpdateUserFormProps
>(({ className, onSuccess }, ref) => {
  const queryClient = useQueryClient()

  const form = useAppForm({
    defaultValues: {
      name: '',
      email: '',
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(1, 'Nama diperlukan'),
        email: z
          .string()
          .email('Alamat email tidak valid')
          .min(1, 'Email diperlukan'),
        role: z.enum(['user', 'mentor']),
      }),
    },
    onSubmit: async ({ value }) => {
      console.log(value)

      try {
        // await updateUser({
        //   name: value.name,
        //   email: value.email,
        //   role: value.role as 'user' | 'mentor',
        // })

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

  return (
    <form 
    // ref={form.ref} 
    className={className} onSubmit={form.handleSubmit}>
      {/* Form fields go here */}
    </form>
  )
})
