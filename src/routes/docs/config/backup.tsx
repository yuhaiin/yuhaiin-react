import { createFileRoute } from '@tanstack/react-router'
import Page from '@/docs/config/backup/page'
import { AnimatedRoute } from '@/component/AnimatedRoute'

function ConfigBackupComponent() {
    return <AnimatedRoute><Page /></AnimatedRoute>
}

export const Route = createFileRoute('/docs/config/backup')({
  component: ConfigBackupComponent,
})
