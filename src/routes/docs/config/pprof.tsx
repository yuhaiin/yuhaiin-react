import { createFileRoute } from '@tanstack/react-router'
import Page from '@/docs/config/pprof/page'
import { AnimatedRoute } from '@/component/AnimatedRoute'

function ConfigPprofComponent() {
    return <AnimatedRoute><Page /></AnimatedRoute>
}

export const Route = createFileRoute('/docs/config/pprof')({
  component: ConfigPprofComponent,
})
