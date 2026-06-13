import { useEffect } from 'react'
import Header from '@/widgets/header'
import { AppSidebar } from '@/widgets/sidebar'
import { SidebarInset, SidebarProvider } from '@/shared/ui/sidebar'
import { useSessionStore } from '@/shared/hooks/use-session'
import { createFileRoute, Outlet, redirect, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticatedLayout')({
  loader: () => {
    const { refreshToken } = useSessionStore.getState()

    if (!refreshToken) throw redirect({ to: '/login' })
  },
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const refreshToken = useSessionStore((state) => state.refreshToken)

  useEffect(() => {
    if (!refreshToken) {
      navigate({ to: '/login' })
    }
  }, [refreshToken, navigate])

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <Header />
        <div className="flex flex-1 flex-col items-center">
          <div className="@container/main flex flex-1 flex-col w-full px-6 sm:px-12 lg:px-16 py-6 md:py-8 gap-2">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
