import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import z from 'zod'

import { Button } from '@/shared/ui/button'
import { useAppForm } from '@/shared/hooks/form'
import { readApiError } from '@/shared/lib/api-error'
import { http } from '@/shared/lib/axios'

const schema = z
  .object({
    new_password: z
      .string()
      .min(1, 'Kata sandi baru wajib diisi')
      .min(6, 'Kata sandi minimal 6 karakter')
      .max(30, 'Kata sandi maksimal 30 karakter'),
    confirm_password: z
      .string()
      .min(1, 'Konfirmasi kata sandi wajib diisi')
      .min(6, 'Kata sandi minimal 6 karakter')
      .max(30, 'Kata sandi maksimal 30 karakter'),
  })
  .refine((data) => data.confirm_password === data.new_password, {
    path: ['confirm_password'],
    message: 'Konfirmasi kata sandi tidak cocok',
  })

export const Route = createFileRoute('/_uauthenticatedLayout/reset-password/')({
  validateSearch: z.object({ token: z.string().optional() }),
  component: RouteComponent,
})

function RouteComponent() {
  const { token } = Route.useSearch()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isReset, setIsReset] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: {
      new_password: '',
      confirm_password: '',
    },
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      if (!token) {
        setErrorMessage('Tautan reset kata sandi tidak valid.')
        return
      }

      setIsSubmitting(true)
      setErrorMessage(null)

      try {
        await http.put('/users/update-password', {
          token,
          new_password: value.new_password,
          confirm_password: value.confirm_password,
        })
        setIsReset(true)
        toast.success('Kata sandi berhasil diperbarui')
      } catch (error) {
        const apiError = readApiError(error, 'Gagal memperbarui kata sandi')
        const message =
          apiError.status === 400
            ? 'Tautan reset kata sandi tidak valid atau sudah kedaluwarsa.'
            : apiError.message

        setErrorMessage(message)
        toast.error(message)
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  if (isReset) {
    return (
      <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto flex size-10 items-center justify-center rounded-md">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-10 w-10 object-cover"
            />
          </div>
          <h1 className="mt-5 text-2xl font-bold">
            Kata sandi berhasil diperbarui
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Silakan masuk menggunakan kata sandi baru Anda.
          </p>
          <Button asChild className="mt-6 w-full">
            <Link to="/login">Masuk</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex justify-center gap-2 font-medium">
          <div className="flex size-6 items-center justify-center rounded-md">
            <img src="/logo.png" alt="Logo" className="h-6 w-6 object-cover" />
          </div>
          Lentera Cendekia Dashboard
        </div>
        <div className="mt-6">
          <h1 className="text-2xl font-bold">Atur ulang kata sandi</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Masukkan kata sandi baru untuk akun Anda.
          </p>
        </div>

        {token ? (
          <form
            className="mt-6 flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              event.stopPropagation()
              form.handleSubmit()
            }}
          >
            <form.AppField name="new_password">
              {(field) => (
                <field.TextField
                  name="new_password"
                  label="Kata Sandi Baru"
                  type="password"
                />
              )}
            </form.AppField>

            <form.AppField name="confirm_password">
              {(field) => (
                <field.TextField
                  name="confirm_password"
                  label="Konfirmasi Kata Sandi"
                  type="password"
                />
              )}
            </form.AppField>

            {errorMessage ? (
              <p className="text-destructive text-sm">{errorMessage}</p>
            ) : null}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : null}
              Simpan kata sandi
            </Button>
          </form>
        ) : (
          <div className="mt-6 flex flex-col gap-4">
            <p className="text-destructive text-sm">
              Tautan reset kata sandi tidak valid. Silakan minta tautan baru.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/forgot-password">Minta tautan baru</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
