import { useHeaderStore } from '@/integrations/zustand/hooks/use-header'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticatedLayout/')({
  loader: () => {
    const setTitle = useHeaderStore.getState().setTitle
    setTitle('Dashboard')
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticatedLayout/"!</div>
}
