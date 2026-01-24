import { createFileRoute } from '@tanstack/react-router'
import Page from '@/docs/bypass/resolver/page'

export const Route = createFileRoute('/docs/bypass/resolver')({
  component: Page,
})
