import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticatedLayout/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticatedLayout/"!</div>
}
