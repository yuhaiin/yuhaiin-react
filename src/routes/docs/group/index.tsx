import { createFileRoute } from '@tanstack/react-router'
import Page from '@/docs/group/page'
import { AnimatedRoute } from '@/component/AnimatedRoute'

function GroupIndexComponent() {
    return <AnimatedRoute><Page /></AnimatedRoute>
}

export const Route = createFileRoute('/docs/group/')({
  component: GroupIndexComponent,
})
