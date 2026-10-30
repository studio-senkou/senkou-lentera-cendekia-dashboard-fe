import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import z from 'zod'

import { Button } from '@/shared/ui/button'
import { useAppForm } from '@/shared/hooks/form'
import { readApiError } from '@/shared/lib/api-error'
import { http } from '@/shared/lib/axios'

const schema = z.object({
  email: z
    .string()
    .email('Alamat email tidak valid')
    .min(1, 'Email wajib diisi'),
})

export const Route = createFileRoute('/_uauthenticatedLayout/forgot-password/')(
  {
    component: RouteComponent,
  },
)

function RouteComponent() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sentEmail, setSentEmail] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: {
      email: '',
    },
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true)
      setErrorMessage(null)

      try {
        await http.post('/users/reset-password', { email: value.email })
        setSentEmail(value.email)
        toast.success('Email reset kata sandi telah dikirim')
      } catch (error) {
        const apiError = readApiError(
          error,
          'Gagal mengirim email reset kata sandi',
        )
        const message =
          apiError.status === 404 ||
          apiError.message.includes('sql: no rows in result set')
            ? 'Email tidak terdaftar.'
            : apiError.message === 'User email is not verified'
              ? 'Email belum diverifikasi. Selesaikan verifikasi akun terlebih dahulu.'
              : apiError.message

        setErrorMessage(message)
        toast.error(message)
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  if (sentEmail) {
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
          <h1 className="mt-5 text-2xl font-bold">Periksa email Anda</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Kami telah mengirim tautan reset kata sandi ke{' '}
            <strong>{sentEmail}</strong>. Tautan tersebut berlaku selama 15
            menit.
          </p>
          <Button asChild variant="outline" className="mt-6 w-full">
            <Link to="/login">Kembali ke halaman masuk</Link>
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
          <h1 className="text-2xl font-bold">Lupa kata sandi?</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Masukkan email akun Anda. Kami akan mengirim tautan untuk mengatur
            ulang kata sandi.
          </p>
        </div>

        <form
          className="mt-6 flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            form.handleSubmit()
          }}
        >
          <form.AppField name="email">
            {(field) => (
              <field.TextField type="email" name="email" label="Email" />
            )}
          </form.AppField>

          {errorMessage ? (
            <p className="text-destructive text-sm">{errorMessage}</p>
          ) : null}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin" /> : null}
            Kirim tautan reset
          </Button>
        </form>

        <p className="text-muted-foreground mt-6 text-center text-sm">
          Ingat kata sandi Anda?{' '}
          <Link
            to="/login"
            className="text-foreground font-medium underline-offset-4 hover:underline"
          >
            Masuk
          </Link>
        </p>
      </div>
    </div>
  )
}
