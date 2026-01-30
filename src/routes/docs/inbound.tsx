import { createFileRoute } from '@tanstack/react-router'
import Page from '@/docs/inbound/page'
import { AnimatedRoute } from '@/component/AnimatedRoute'

function InboundComponent() {
    return <AnimatedRoute><Page /></AnimatedRoute>
}

export const Route = createFileRoute('/docs/inbound')({
  component: InboundComponent,
})
