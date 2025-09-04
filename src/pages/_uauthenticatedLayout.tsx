import { useSessionStore } from '@/shared/hooks/use-session'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_uauthenticatedLayout')({
  loader: () => {
    const { refreshToken } = useSessionStore.getState()

    if (refreshToken) throw redirect({ to: '/' })
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <Outlet />
    </div>
  )
}
