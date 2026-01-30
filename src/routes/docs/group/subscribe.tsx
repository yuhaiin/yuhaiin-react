import { createFileRoute } from '@tanstack/react-router'
import Page from '@/docs/group/subscribe/page'
import { AnimatedRoute } from '@/component/AnimatedRoute'

function GroupSubscribeComponent() {
    return <AnimatedRoute><Page /></AnimatedRoute>
}

export const Route = createFileRoute('/docs/group/subscribe')({
  component: GroupSubscribeComponent,
})
