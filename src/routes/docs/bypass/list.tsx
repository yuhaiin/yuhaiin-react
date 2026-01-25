import { createFileRoute } from '@tanstack/react-router'
import Page from '@/docs/bypass/list/page'

export const Route = createFileRoute('/docs/bypass/list')({
  component: Page,
})
