import { createFileRoute } from '@tanstack/react-router'
import Page from '@/docs/config/licenses/page'

export const Route = createFileRoute('/docs/config/licenses')({
  component: Page,
})
