import { createFileRoute } from '@tanstack/react-router'
import Page from '@/docs/connections/history/page'
import { AnimatedRoute } from '@/component/AnimatedRoute'

function ConnectionsHistoryComponent() {
    return <AnimatedRoute><Page /></AnimatedRoute>
}

export const Route = createFileRoute('/docs/connections/history')({
  component: ConnectionsHistoryComponent,
})
