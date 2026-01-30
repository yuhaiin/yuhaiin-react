import { createFileRoute } from '@tanstack/react-router'
import Page from '@/docs/config/about/page'
import { AnimatedRoute } from '@/component/AnimatedRoute'

function ConfigAboutComponent() {
    return <AnimatedRoute><Page /></AnimatedRoute>
}

export const Route = createFileRoute('/docs/config/about')({
  component: ConfigAboutComponent,
})
