import { createFileRoute } from '@tanstack/react-router'
import Page from '@/docs/config/documents/page'

export const Route = createFileRoute('/docs/config/documents')({
  component: Page,
})
