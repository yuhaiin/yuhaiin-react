import { createFileRoute } from '@tanstack/react-router'
import Page from '@/docs/bypass/page'
import { AnimatedRoute } from '@/component/AnimatedRoute'

function BypassIndexComponent() {
    return <AnimatedRoute><Page /></AnimatedRoute>
}

export const Route = createFileRoute('/docs/bypass/')({
  component: BypassIndexComponent,
})
