import { createFileRoute } from '@tanstack/react-router'
import Page from '@/docs/config/backup/page'

export const Route = createFileRoute('/docs/config/backup')({
  component: Page,
})
