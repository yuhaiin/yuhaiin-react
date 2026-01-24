import { createFileRoute } from '@tanstack/react-router'
import Page from '@/docs/connections/failed/page'

export const Route = createFileRoute('/docs/connections/failed')({
  component: Page,
})
