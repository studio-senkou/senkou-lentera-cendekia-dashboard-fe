import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/routes/__root')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/routes/__root"!</div>
}
