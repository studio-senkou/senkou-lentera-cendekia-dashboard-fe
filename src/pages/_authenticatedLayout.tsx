import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Outlet,
  createFileRoute,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import Header from '@/widgets/header'
import { AppSidebar } from '@/widgets/sidebar'
import { SidebarInset, SidebarProvider } from '@/shared/ui/sidebar'
import { useSessionStore } from '@/shared/hooks/use-session'
import { useUserStore } from '@/shared/hooks/use-user'
import { getUserDetails } from '@/entities/users'

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
  const setUser = useUserStore((state) => state.setUser)

  const { data: currentUser } = useQuery({
    queryKey: ['auth', 'me', refreshToken],
    queryFn: getUserDetails,
    enabled: Boolean(refreshToken),
    staleTime: 60_000,
  })

  useEffect(() => {
    if (!refreshToken) {
      navigate({ to: '/login' })
    }
  }, [refreshToken, navigate])

  useEffect(() => {
    if (currentUser) setUser(currentUser)
  }, [currentUser, setUser])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <Header />
        <div className="bg-grey-custom flex flex-1 flex-col items-center">
          <div className="@container/main flex w-full flex-1 flex-col px-6 py-6 sm:px-12 md:py-8 lg:px-16">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
