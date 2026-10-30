import { useEffect, useRef } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { isAxiosError } from 'axios'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { getUserDetails } from '@/entities/users'
import { http } from '@/shared/lib/axios'
import { useSessionStore } from '@/shared/hooks/use-session'
import { useUserStore } from '@/shared/hooks/use-user'

export const Route = createFileRoute('/auth/callback')({
  component: GoogleAuthCallback,
})

/**
 * Error codes the backend can append (?error=…) — see materializeSession /
 * callback in the API's src/routes/auth-google.ts. Google's own codes
 * (e.g. access_denied) pass through untouched.
 */
const ERROR_MESSAGES: Record<string, string> = {
  access_denied: 'Anda membatalkan permintaan persetujuan Google.',
  missing_code: 'Login Google gagal: kode otorisasi tidak diterima. Coba lagi.',
  token_exchange: 'Login Google gagal saat menukar kode. Coba lagi.',
  userinfo: 'Login Google gagal: tidak bisa membaca profil Anda. Coba lagi.',
  no_email: 'Akun Google Anda tidak memiliki alamat email.',
  email_unverified: 'Email pada akun Google Anda belum terverifikasi.',
  account_unavailable: 'Akun dengan email ini tidak tersedia. Hubungi admin.',
  tenant_not_found:
    'Tenant tidak ditemukan. Periksa kembali alamat dashboard yang Anda gunakan.',
  user_create: 'Gagal menyiapkan akun baru. Coba lagi.',
  session_save: 'Gagal menyimpan sesi. Coba lagi.',
}

function googleErrorMessage(code: string): string {
  return ERROR_MESSAGES[code] ?? `Login Google gagal (${code}). Coba lagi.`
}

interface GoogleAuthMessage {
  type: 'google-auth'
  ok: boolean
  message?: string
}

/**
 * Popup flow: tell the opener tab what happened, then close this window.
 * Returns false when this is not a popup (normal same-tab redirect).
 */
function notifyOpener(payload: GoogleAuthMessage): boolean {
  if (!window.opener) {
    return false
  }

  // Same origin by construction: the popup and opener both live on the FE.
  ;(window.opener as Window).postMessage(payload, window.location.origin)
  window.close()
  return true
}

/**
 * Landing page after the backend's Google callback.
 *
 * On success the backend has already redirected here CLEAN (no tokens in the
 * URL) with httpOnly session cookies set on the API origin. Those cookies are
 * unreadable from JS, so this page exchanges them for a JS-readable token pair
 * via `GET /auth/session` (same `data` shape as password login) and feeds it
 * through the exact store operations the login form uses — then reloads into
 * the app.
 *
 * On failure the backend appended `?error=<code>`; we surface a friendly
 * message and return to /login.
 */
function GoogleAuthCallback() {
  const startedRef = useRef(false)

  useEffect(() => {
    // React StrictMode runs effects twice; materializing once is enough.
    if (startedRef.current) return
    startedRef.current = true

    const errorCode = new URLSearchParams(window.location.search).get('error')

    async function finish(): Promise<void> {
      if (errorCode) {
        const message = googleErrorMessage(errorCode)

        if (!notifyOpener({ type: 'google-auth', ok: false, message })) {
          toast.error(message)
          window.location.assign('/login')
        }
        return
      }

      // Start clean: drop any stale local tokens so the axios request
      // interceptor cannot attach an old Authorization header — the backend
      // middleware prefers a present header over the httpOnly cookies, and a
      // stale one would fail the whole exchange.
      useSessionStore.getState().clearLocalSession()

      try {
        // Exchange the httpOnly cookies for a login-shaped token pair.
        const response = await http.get('/auth/session')
        useSessionStore.getState().updateSession(response.data.data)

        const user = await getUserDetails()
        if (user) {
          useUserStore.getState().setUser(user)
        }

        if (!notifyOpener({ type: 'google-auth', ok: true })) {
          window.location.assign('/')
        }
      } catch (error) {
        const unauthorized =
          isAxiosError(error) && error.response?.status === 401
        const message = unauthorized
          ? 'Sesi Google tidak valid. Silakan coba lagi.'
          : 'Gagal menyelesaikan login dengan Google. Coba lagi.'

        if (!notifyOpener({ type: 'google-auth', ok: false, message })) {
          // A 401 is already toasted + redirected by the axios interceptor.
          if (!unauthorized) toast.error(message)
          window.location.assign('/login')
        }
      }
    }

    void finish()
  }, [])

  return (
    <div className="grid min-h-svh place-items-center">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
        <p className="text-sm">Menyelesaikan login dengan Google…</p>
      </div>
    </div>
  )
}
