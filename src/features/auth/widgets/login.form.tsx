import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import z from 'zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'

import { useAppForm } from '@/shared/hooks/form'
import { useSessionStore } from '@/shared/hooks/use-session'
import { useUserStore } from '@/shared/hooks/use-user'
import { getUserDetails } from '@/entities/users'
import { env } from '@/app/env'

interface LoginFormProps extends React.HTMLAttributes<HTMLFormElement> {
  className?: string
}

interface GoogleAuthMessage {
  type?: string
  ok?: boolean
  message?: string
}

const schema = z.object({
  email: z
    .string()
    .email('Alamat email tidak valid')
    .min(1, 'Email wajib diisi'),
  password: z.string().min(1, 'Kata sandi wajib diisi'),
})

export const LoginForm: React.FC<LoginFormProps> = ({
  className,
  ...props
}) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false)

  const popupRef = useRef<Window | null>(null)
  const pollRef = useRef<number | null>(null)

  const authenticate = useSessionStore((state) => state.authenticate)
  const updateUser = useUserStore((state) => state.setUser)

  const stopPolling = useCallback(() => {
    if (pollRef.current !== null) {
      window.clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  const finishGoogleLogin = useCallback(async () => {
    stopPolling()
    popupRef.current?.close()
    popupRef.current = null

    const user = await getUserDetails()

    if (user) {
      updateUser(user)
    }

    window.location.assign('/')
  }, [stopPolling, updateUser])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return

      const data: unknown = event.data
      if (typeof data !== 'object' || data === null) return

      const payload = data as GoogleAuthMessage
      if (payload.type !== 'google-auth') return

      if (payload.ok) {
        void finishGoogleLogin()
        return
      }

      stopPolling()
      popupRef.current?.close()
      popupRef.current = null
      setIsGoogleLoading(false)
      toast.error(payload.message ?? 'Login Google gagal. Silakan coba lagi.')
    }

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
      stopPolling()
    }
  }, [finishGoogleLogin, stopPolling])

  const form = useAppForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onSubmit: schema,
    },
    onSubmit: async (values) => {
      setIsSubmitting(true)

      const { email, password } = values.value

      try {
        await authenticate(email, password)

        const user = await getUserDetails()

        if (user) {
          updateUser(user)
        }

        window.location.assign('/')
      } catch (error) {
        console.error(error)
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  const handleGoogleLogin = () => {
    // Popup flow: the backend answers with a 302 to Google's authorize
    // endpoint (redirect_uri = this API origin + /api/v1/auth/google/callback).
    // The flow lands back on /auth/callback inside the popup when done.
    //
    // fe_origin: the backend binds this into the signed OAuth state
    // and honors it at the callback ONLY for allowlisted origins.
    const apiBase = (env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '')
    const feOrigin = encodeURIComponent(window.location.origin)
    const url = `${apiBase}/auth/google?fe_origin=${feOrigin}`

    const width = 520
    const height = 640
    const left = window.screenX + Math.max(0, (window.outerWidth - width) / 2)
    const top = window.screenY + Math.max(0, (window.outerHeight - height) / 2)

    const popup = window.open(
      url,
      'google-login',
      `popup=yes,width=${width},height=${height},left=${left},top=${top}`,
    )

    if (!popup) {
      toast.error('Popup diblokir. Login Google dibuka di tab ini.')
      window.location.assign(url)
      return
    }

    popupRef.current = popup
    setIsGoogleLoading(true)

    stopPolling()
    pollRef.current = window.setInterval(() => {
      if (popup.closed) {
        stopPolling()
        popupRef.current = null
        setIsGoogleLoading(false)
      }
    }, 500)
  }

  return (
    <form
      className={cn('flex flex-col gap-6', className)}
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Masuk ke akun Anda</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Masukkan email Anda di bawah ini untuk masuk
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <form.AppField name="email">
            {(field) => (
              <field.TextField type="email" name="email" label="Email" />
            )}
          </form.AppField>
        </div>
        <div className="grid gap-3">
          <form.AppField name="password">
            {(field) => (
              <field.TextField
                name="password"
                label="Kata Sandi"
                type="password"
                secondaryLabel={
                  <Link
                    to="/forgot-password"
                    tabIndex={-1}
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Lupa kata sandi?
                  </Link>
                }
              />
            )}
          </form.AppField>
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          Masuk
        </Button>
        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">
            Atau lanjutkan dengan
          </span>
        </div>
        <Button
          variant="outline"
          className="w-full"
          type="button"
          disabled={isGoogleLoading}
          onClick={handleGoogleLogin}
        >
          {isGoogleLoading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              width="24"
              height="24"
            >
              <g>
                <path
                  fill="#4285F4"
                  d="M44.5 20H24v8.5h11.7C34.9 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.2-6.2C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.6 20-21 0-1.3-.1-2.7-.5-4z"
                />
                <path
                  fill="#34A853"
                  d="M6.3 14.7l7 5.1C15.6 16.1 19.5 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.2-6.2C34.6 5.1 29.6 3 24 3c-7.2 0-13 5.8-13 13 0 1.7.3 3.3.8 4.7z"
                />
                <path
                  fill="#FBBC05"
                  d="M24 44c5.6 0 10.6-1.9 14.5-5.2l-7-5.7C29.7 34.9 27 36 24 36c-6.1 0-11.2-4.1-13-9.7l-7 5.4C7.2 39.7 14.9 44 24 44z"
                />
                <path
                  fill="#EA4335"
                  d="M44.5 20H24v8.5h11.7c-1.1 3.1-4.1 5.5-7.7 5.5-3.1 0-5.9-1.1-8.1-2.9l-6.2 6.2C13.4 42.9 18.4 45 24 45c10.5 0 20-7.6 20-21 0-1.3-.1-2.7-.5-4z"
                />
              </g>
            </svg>
          )}
          {isGoogleLoading ? 'Menghubungkan…' : 'Masuk dengan Google'}
        </Button>
      </div>
    </form>
  )
}
