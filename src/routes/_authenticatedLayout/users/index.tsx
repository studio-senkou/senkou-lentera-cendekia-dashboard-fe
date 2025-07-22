import { Table } from '@/components/table'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticatedLayout/users/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <Table
        columns={[
          {
            accessorKey: 'name',
            header: 'Name',
          },
          {
            accessorKey: 'email',
            header: 'Email',
          },
          {
            accessorKey: 'role',
            header: 'Role',
          },
        ]}
        data={[
          { name: 'John Doe', email: 'john@example.com', role: 'Admin' },
          { name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
          { name: 'Alice Johnson', email: 'alice@example.com', role: 'Editor' },
          { name: 'Bob Brown', email: 'bob@example.com', role: 'Viewer' },
          {
            name: 'Charlie White',
            email: 'charlie@example.com',
            role: 'Contributor',
          },
          {
            name: 'Diana Green',
            email: 'diana@example.com',
            role: 'Contributor',
          },
          {
            name: 'Ethan Blue',
            email: 'ethan@example.com',
            role: 'Contributor',
          },
          {
            name: 'Fiona Black',
            email: 'fiona@example.com',
            role: 'Contributor',
          },
          {
            name: 'George Yellow',
            email: 'george@example.com',
            role: 'Contributor',
          },
          {
            name: 'Hannah Purple',
            email: 'hannah@example.com',
            role: 'Contributor',
          },
        ]}
      />
    </div>
  )
}
