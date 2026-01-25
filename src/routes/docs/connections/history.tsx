import { createFileRoute } from '@tanstack/react-router'
import Page from '@/docs/connections/history/page'

export const Route = createFileRoute('/docs/connections/history')({
  component: Page,
})
