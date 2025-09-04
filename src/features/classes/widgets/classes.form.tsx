import { createClass } from '@/entities/classes'
import { useAppForm } from '@/shared/hooks/form'
import { cn } from '@/shared/lib/utils'
import { useQueryClient } from '@tanstack/react-query'
import { forwardRef, useImperativeHandle, type ComponentProps } from 'react'
import { toast } from 'sonner'
import z from 'zod'

export interface ClassFormProps extends ComponentProps<'form'> {
  className?: string
}

export interface ClassFormRef {
  submit: () => Promise<void>
}

const schema = z.object({
  classname: z
    .string({
      message: 'Nama kelas harus diisi',
    })
    .min(3, {
      message: 'Nama kelas minimal 3 karakter',
    }),
})

export const ClassForm = forwardRef<ClassFormRef, ClassFormProps>(
  ({ className, ...props }, ref) => {
    const queryClient = useQueryClient()

    const form = useAppForm({
      defaultValues: {
        classname: '',
      },
      validators: {
        onSubmit: schema,
      },
      onSubmitInvalid: (_) => {
        throw new Error('Invalid form submission')
      },
      onSubmit: async (values) => {
        try {
          await createClass({
            classname: values.value.classname,
          })

          queryClient.invalidateQueries({ queryKey: ['classes'] })

          form.reset()

          toast.success('Berhasil membuat kelas')
        } catch (error) {
          console.error(error)
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
        id="create-class-form"
        className={cn('px-4', className)}
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        {...props}
      >
        <AppField name="classname">
          {({ TextField }) => (
            <TextField
              type="text"
              label="Nama Kelas"
              required
              name="classname"
              placeholder="Masukkan nama kelas"
            />
          )}
        </AppField>
      </form>
    )
  },
)
