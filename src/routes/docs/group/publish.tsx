import { createFileRoute } from '@tanstack/react-router'
import Page from '@/docs/group/publish/page'
import { AnimatedRoute } from '@/component/AnimatedRoute'

function GroupPublishComponent() {
    return <AnimatedRoute><Page /></AnimatedRoute>
}

export const Route = createFileRoute('/docs/group/publish')({
  component: GroupPublishComponent,
})
