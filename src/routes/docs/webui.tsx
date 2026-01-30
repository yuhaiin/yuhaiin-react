import { createFileRoute } from '@tanstack/react-router'
import Page from '@/docs/webui/page'
import { AnimatedRoute } from '@/component/AnimatedRoute'

function WebuiComponent() {
    return <AnimatedRoute><Page /></AnimatedRoute>
}

export const Route = createFileRoute('/docs/webui')({
  component: WebuiComponent,
})
