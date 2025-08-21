import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import z from 'zod'
import { useAppForm } from '@/hooks/form'
import { useSessionStore } from '@/integrations/zustand/hooks/use-session'
import { useUserStore } from '@/integrations/zustand/hooks/use-user'
import { getUserDetails } from '@/lib/users'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'

interface LoginFormProps extends React.HTMLAttributes<HTMLFormElement> {
  className?: string
}

const schema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
})

export const LoginForm: React.FC<LoginFormProps> = ({
  className,
  ...props
}) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const authenticate = useSessionStore((state) => state.authenticate)
  const updateUser = useUserStore((state) => state.setUser)

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
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email below to login to your account
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
                label="Password"
                type="password"
                secondaryLabel={
                  <a
                    href="#"
                    tabIndex={-1}
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                }
              />
            )}
          </form.AppField>
        </div>
        <Button type="submit" className="w-full">
          {isSubmitting && <Loader2 className="animate-spin mr-4" />}
          Login
        </Button>
        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">
            Or continue with
          </span>
        </div>
        <Button variant="outline" className="w-full" disabled>
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
          Login with Google
        </Button>
      </div>
    </form>
  )
}
