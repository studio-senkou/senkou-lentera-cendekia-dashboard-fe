import TanStackQueryLayout from '@/app/integrations/tanstack-query/layout'
import { Toaster } from '@/shared/ui/sonner'
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <Outlet />
      <Toaster position="top-right" richColors closeButton />
      <TanStackRouterDevtools />

      <TanStackQueryLayout />
    </>
  ),
})
