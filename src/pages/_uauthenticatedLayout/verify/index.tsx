import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import z from 'zod'

import { Button } from '@/shared/ui/button'
import { useAppForm } from '@/shared/hooks/form'
import { http } from '@/shared/lib/axios'

const schema = z.object({
  password: z
    .string()
    .max(30, 'Kata sandi maksimal 30 karakter')
    .refine(
      (value) => value === '' || value.length >= 6,
      'Kata sandi minimal 6 karakter',
    ),
})

export const Route = createFileRoute('/_uauthenticatedLayout/verify/')({
  validateSearch: z.object({ token: z.string().optional() }),
  component: RouteComponent,
})

function RouteComponent() {
  const { token } = Route.useSearch()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [activeRole, setActiveRole] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: {
      password: '',
    },
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      if (!token) {
        setErrorMessage('Tautan verifikasi tidak valid.')
        return
      }

      setIsSubmitting(true)
      setErrorMessage(null)

      try {
        const response = await http.post('/users/activate', {
          activation_token: token,
          ...(value.password === '' ? {} : { password: value.password }),
        })
        const data = (
          response.data as { data?: { active_role?: string } } | undefined
        )?.data
        setActiveRole(data?.active_role ?? null)
        setIsVerified(true)
        toast.success('Akun berhasil diverifikasi')
      } catch (error) {
        const response = (
          error as {
            response?: { data?: { message?: string; error?: string } }
          }
        ).response
        const message =
          response?.data?.error ??
          response?.data?.message ??
          'Gagal memverifikasi akun'
        setErrorMessage(message)
        toast.error(message)
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  if (isVerified) {
    return (
      <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="w-full max-w-sm text-center">
          <div className="text-primary-foreground mx-auto flex size-10 items-center justify-center rounded-md">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-10 w-10 object-cover"
            />
          </div>
          <h1 className="mt-5 text-2xl font-bold">
            Akun berhasil diverifikasi
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Kata sandi akun Anda sudah diatur. Silakan masuk menggunakan kata
            sandi yang Anda pilih, atau <strong>12345678</strong> jika Anda
            tidak mengisinya.
          </p>
          {activeRole === 'user' ? (
            <p className="text-muted-foreground mt-6 text-sm">
              Silakan masuk melalui portal siswa.
            </p>
          ) : (
            <Button asChild className="mt-6 w-full">
              <Link to="/login">Masuk</Link>
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex justify-center gap-2 font-medium">
          <div className="text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <img src="/logo.png" alt="Logo" className="h-6 w-6 object-cover" />
          </div>
          Lentera Cendekia Dashboard
        </div>
        <div className="mt-6">
          <h1 className="text-2xl font-bold">Verifikasi Akun</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Atur kata sandi akun Anda. Kosongkan kolom kata sandi jika ingin
            menggunakan kata sandi bawaan <strong>12345678</strong>.
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
            <form.AppField name="password">
              {(field) => (
                <field.TextField
                  name="password"
                  label="Kata Sandi"
                  type="password"
                  placeholder="Kosongkan untuk 12345678"
                />
              )}
            </form.AppField>

            {errorMessage ? (
              <p className="text-destructive text-sm">{errorMessage}</p>
            ) : null}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : null}
              Verifikasi Akun
            </Button>
          </form>
        ) : (
          <div className="mt-6 flex flex-col gap-4">
            <p className="text-destructive text-sm">
              Tautan verifikasi tidak valid. Silakan gunakan tautan terbaru dari
              email Anda.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/login">Kembali ke halaman masuk</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
