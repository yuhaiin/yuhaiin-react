import { createFileRoute } from '@tanstack/react-router'
import Page from '@/docs/config/log/page'

export const Route = createFileRoute('/docs/config/log')({
  component: Page,
})
