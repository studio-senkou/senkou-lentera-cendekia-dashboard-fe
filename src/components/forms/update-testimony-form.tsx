import { useAppForm } from '@/hooks/form'
import { cn } from '@/lib/utils'
import type { Testimony } from '@/types/response'
import { getAsset } from '@/utils/assets'
import { forwardRef, useImperativeHandle } from 'react'
import { Label } from '../ui/label'
import { updateTestimony } from '@/lib/testimony'
import { useQueryClient } from '@tanstack/react-query'

export interface UpdateTestimonyFormProps {
  testimony: Testimony
  className?: string
}

export interface UpdateTestimonyFormRef {
  submit: () => Promise<void>
}

export const UpdateTestimonyForm = forwardRef<
  UpdateTestimonyFormRef,
  UpdateTestimonyFormProps
>(({ testimony, className, ...props }, ref) => {
  const queryClient = useQueryClient()

  const form = useAppForm({
    defaultValues: {
      testimoner_name: testimony.testimoner_name,
      testimoner_current_position: testimony.testimoner_current_position,
      testimoner_previous_position: testimony.testimoner_previous_position,
      testimony_text: testimony.testimony_text,
      testimoner_photo: undefined as File | undefined,
    },
    validators: {
      onSubmit: (values) => {
        const errors: Record<string, string> = {}

        if (!values.value.testimoner_name?.trim()) {
          errors.testimoner_name = 'Nama testimoni diperlukan'
        }

        if (!values.value.testimoner_current_position?.trim()) {
          errors.testimoner_current_position = 'Posisi terbaru diperlukan'
        }

        if (!values.value.testimoner_previous_position?.trim()) {
          errors.testimoner_previous_position = 'Posisi sebelumnya diperlukan'
        }

        if (!values.value.testimony_text?.trim()) {
          errors.testimony_text = 'Isi testimoni diperlukan'
        }

        if (values.value.testimoner_photo) {
          if (
            !(values.value.testimoner_photo instanceof File) ||
            values.value.testimoner_photo.size === 0
          ) {
            errors.testimoner_photo = 'File foto tidak valid'
          } else if (!values.value.testimoner_photo.type.startsWith('image/')) {
            errors.testimoner_photo = 'Foto testimoner harus berupa gambar'
          }
        }

        return Object.keys(errors).length > 0 ? errors : undefined
      },
    },
    onSubmit: async (values) => {
      try {
        const submitValues = {
          ...values.value,
          testimony_id: testimony.id,
          ...(values.value.testimoner_photo && {
            testimoner_photo: values.value.testimoner_photo,
          }),
        }

        await updateTestimony(submitValues)
        await queryClient.refetchQueries({ queryKey: ['testimonies'] })

        form.reset()
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
                required={testimony.testimoner_photo ? false : true}
              />
            )}
          </form.AppField>

          {testimony.testimoner_photo && (
            <div>
              <Label className="my-3">Foto Sebelumnya: </Label>
              <img
                src={getAsset(testimony?.testimoner_photo)}
                alt={testimony.testimoner_name}
                className="w-24 h-24 rounded object-cover"
                style={{ aspectRatio: '1 / 1' }}
              />
            </div>
          )}
        </div>
        <div className="grid gap-3">
          <form.AppField name="testimony_text">
            {({ TextArea }) => <TextArea required label="Testimoni" />}
          </form.AppField>
        </div>
      </div>
    </form>
  )
})
