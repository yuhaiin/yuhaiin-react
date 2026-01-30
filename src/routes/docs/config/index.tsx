import { createFileRoute } from '@tanstack/react-router'
import Page from '@/docs/config/page'
import { AnimatedRoute } from '@/component/AnimatedRoute'

function ConfigIndexComponent() {
    return <AnimatedRoute><Page /></AnimatedRoute>
}

export const Route = createFileRoute('/docs/config/')({
  component: ConfigIndexComponent,
})
