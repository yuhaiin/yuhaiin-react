import { createFileRoute } from '@tanstack/react-router'
import Page from '@/docs/inbound/page'

export const Route = createFileRoute('/docs/inbound')({
  component: Page,
})
