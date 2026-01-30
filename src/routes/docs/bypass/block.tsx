import { createFileRoute } from '@tanstack/react-router'
import Page from '@/docs/bypass/block/page'
import { AnimatedRoute } from '@/component/AnimatedRoute'

function BypassBlockComponent() {
    return <AnimatedRoute><Page /></AnimatedRoute>
}

export const Route = createFileRoute('/docs/bypass/block')({
  component: BypassBlockComponent,
})
