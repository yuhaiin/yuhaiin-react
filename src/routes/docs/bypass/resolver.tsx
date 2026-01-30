import { createFileRoute } from '@tanstack/react-router'
import Page from '@/docs/bypass/resolver/page'
import { AnimatedRoute } from '@/component/AnimatedRoute'

function BypassResolverComponent() {
    return <AnimatedRoute><Page /></AnimatedRoute>
}

export const Route = createFileRoute('/docs/bypass/resolver')({
  component: BypassResolverComponent,
})
