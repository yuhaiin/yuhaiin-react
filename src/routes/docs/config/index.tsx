import { createFileRoute } from '@tanstack/react-router'
import Page from '@/docs/config/page'

export const Route = createFileRoute('/docs/config/')({
  component: Page,
})
