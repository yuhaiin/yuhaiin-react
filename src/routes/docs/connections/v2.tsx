import { createFileRoute } from '@tanstack/react-router'
import Page from '@/docs/connections/v2/page'

export const Route = createFileRoute('/docs/connections/v2')({
  component: Page,
})
