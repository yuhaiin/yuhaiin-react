import { createFileRoute } from '@tanstack/react-router'
import Page from '@/docs/webui/page'

export const Route = createFileRoute('/docs/webui')({
  component: Page,
})
