import { LoginForm } from '@/components/forms/login-form'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_uauthenticatedLayout/login/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-6 w-6 object-cover"
              />
            </div>
            Lentera Cendekia Dashboard
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/onboard.webp"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
