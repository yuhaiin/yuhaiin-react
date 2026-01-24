import { createFileRoute } from '@tanstack/react-router'
import Page from '@/docs/config/pprof/page'

export const Route = createFileRoute('/docs/config/pprof')({
  component: Page,
})
