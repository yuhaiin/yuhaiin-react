import { createFileRoute } from '@tanstack/react-router'
import Page from '@/docs/bypass/test/page'

export const Route = createFileRoute('/docs/bypass/test')({
  component: Page,
})
