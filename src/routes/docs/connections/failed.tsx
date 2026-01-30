import { createFileRoute } from '@tanstack/react-router'
import Page from '@/docs/connections/failed/page'
import { AnimatedRoute } from '@/component/AnimatedRoute'

function ConnectionsFailedComponent() {
    return <AnimatedRoute><Page /></AnimatedRoute>
}

export const Route = createFileRoute('/docs/connections/failed')({
  component: ConnectionsFailedComponent,
})
