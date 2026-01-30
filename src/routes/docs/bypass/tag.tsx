import { createFileRoute } from '@tanstack/react-router'
import Page from '@/docs/bypass/tag/page'
import { AnimatedRoute } from '@/component/AnimatedRoute'

function BypassTagComponent() {
    return <AnimatedRoute><Page /></AnimatedRoute>
}

export const Route = createFileRoute('/docs/bypass/tag')({
  component: BypassTagComponent,
})
