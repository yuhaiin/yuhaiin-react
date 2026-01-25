import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/docs/config')({
  component: () => <Outlet />,
})
