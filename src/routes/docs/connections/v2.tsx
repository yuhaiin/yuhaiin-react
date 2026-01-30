import { createFileRoute } from '@tanstack/react-router'
import Page from '@/docs/connections/v2/page'
import { AnimatedRoute } from '@/component/AnimatedRoute'

function ConnectionsV2Component() {
    return <AnimatedRoute><Page /></AnimatedRoute>
}

export const Route = createFileRoute('/docs/connections/v2')({
  component: ConnectionsV2Component,
})
