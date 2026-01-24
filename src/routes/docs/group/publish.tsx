import { createFileRoute } from '@tanstack/react-router'
import Page from '@/docs/group/publish/page'

export const Route = createFileRoute('/docs/group/publish')({
  component: Page,
})
