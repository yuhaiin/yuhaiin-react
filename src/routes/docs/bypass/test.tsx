import { createFileRoute } from '@tanstack/react-router'
import Page from '@/docs/bypass/test/page'
import { AnimatedRoute } from '@/component/AnimatedRoute'

function BypassTestComponent() {
    return <AnimatedRoute><Page /></AnimatedRoute>
}

export const Route = createFileRoute('/docs/bypass/test')({
  component: BypassTestComponent,
})
