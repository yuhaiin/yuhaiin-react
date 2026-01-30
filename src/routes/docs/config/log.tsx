import { createFileRoute } from '@tanstack/react-router'
import Page from '@/docs/config/log/page'
import { AnimatedRoute } from '@/component/AnimatedRoute'

function ConfigLogComponent() {
    return <AnimatedRoute><Page /></AnimatedRoute>
}

export const Route = createFileRoute('/docs/config/log')({
  component: ConfigLogComponent,
})
