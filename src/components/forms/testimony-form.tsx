import { cn } from '@/lib/utils'
import z from 'zod'
import { useAppForm } from '@/hooks/form'
import { forwardRef, useImperativeHandle } from 'react'
import { storeNewTestimony } from '@/lib/testimony'
import { useQueryClient } from '@tanstack/react-query'

export interface TestimonyFormProps
  extends React.HTMLAttributes<HTMLFormElement> {
  className?: string
}

export interface TestimonyFormRef {
  submit: () => Promise<void>
}

const testimonySchema = z.object({
  testimoner_name: z.string().min(1, 'Name is required'),
  testimoner_current_position: z.string(),
  testimoner_previous_position: z.string(),
  testimony_text: z.string().min(1, 'Testimony is required'),
  testimoner_photo: z
    .instanceof(File)
    .refine((file) => file.size > 0, {
      message: 'Testimoner photo is required',
    })
    .refine((file) => file.type.startsWith('image/'), {
      message: 'Testimoner photo must be an image',
    }),
})

export const TestimonyForm = forwardRef<TestimonyFormRef, TestimonyFormProps>(
  ({ className, ...props }, ref) => {
    const queryClient = useQueryClient()

    const form = useAppForm({
      defaultValues: {
        testimoner_name: '',
        testimoner_current_position: '',
        testimoner_previous_position: '',
        testimony_text: '',
        testimoner_photo: undefined as unknown as File,
      },
      validators: {
        onSubmit: testimonySchema,
      },
      onSubmit: async (values) => {
        try {
          const submitValues = {
            ...values.value,
            testimoner_photo: values.value.testimoner_photo as File,
          }
          const success = await storeNewTestimony(submitValues)

          if (success) {
            await queryClient.refetchQueries({ queryKey: ['testimonies'] })
            form.reset()
          } else {
            throw new Error('Failed to create testimony')
          }
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

    return (
      <form
        className={cn('flex flex-col gap-6 p-4', className)}
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        {...props}
      >
        <div className="grid gap-6">
          <div className="grid gap-3">
            <form.AppField name="testimoner_name">
              {({ TextField }) => (
                <TextField
                  type="text"
                  name="testimoner_name"
                  label="Nama Testimoner"
                  placeholder="Masukkan nama lengkap testimoner"
                  required
                />
              )}
            </form.AppField>
          </div>
          <div className="grid gap-3">
            <form.AppField name="testimoner_current_position">
              {({ TextField }) => (
                <TextField
                  type="text"
                  name="testimoner_current_position"
                  label="Posisi Saat Ini"
                  placeholder="Masukkan posisi testimoner sekarang"
                />
              )}
            </form.AppField>
          </div>
          <div className="grid gap-3">
            <form.AppField name="testimoner_previous_position">
              {({ TextField }) => (
                <TextField
                  type="text"
                  name="testimoner_previous_position"
                  label="Posisi Sebelumnya"
                  placeholder="Masukkan posisi testimoner sebelumnya"
                />
              )}
            </form.AppField>
          </div>
          <div className="grid gap-3">
            <form.AppField name="testimoner_photo">
              {({ FileInput }) => (
                <FileInput
                  label="Foto Testimoner"
                  accept="image/*"
                  maxSize={2 * 1024 * 1024}
                  name="testimoner_photo"
                  required
                />
              )}
            </form.AppField>
          </div>
          <div className="grid gap-3">
            <form.AppField name="testimony_text">
              {({ TextArea }) => <TextArea required label="Testimoni" />}
            </form.AppField>
          </div>
        </div>
      </form>
    )
  },
)
