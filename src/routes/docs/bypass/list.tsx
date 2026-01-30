import { createFileRoute } from '@tanstack/react-router'
import Page from '@/docs/bypass/list/page'
import { AnimatedRoute } from '@/component/AnimatedRoute'

function BypassListComponent() {
    return <AnimatedRoute><Page /></AnimatedRoute>
}

export const Route = createFileRoute('/docs/bypass/list')({
  component: BypassListComponent,
})
