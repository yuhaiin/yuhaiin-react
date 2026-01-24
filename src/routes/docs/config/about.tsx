import { createFileRoute } from '@tanstack/react-router'
import Page from '@/docs/config/about/page'

export const Route = createFileRoute('/docs/config/about')({
  component: Page,
})
