import { createFileRoute } from '@tanstack/react-router'
import Page from '@/docs/group/activates/page'
import { AnimatedRoute } from '@/component/AnimatedRoute'

function GroupActivatesComponent() {
    return <AnimatedRoute><Page /></AnimatedRoute>
}

export const Route = createFileRoute('/docs/group/activates')({
  component: GroupActivatesComponent,
})
