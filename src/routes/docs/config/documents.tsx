import { createFileRoute } from '@tanstack/react-router'
import Page from '@/docs/config/documents/page'
import { AnimatedRoute } from '@/component/AnimatedRoute'

function ConfigDocumentsComponent() {
    return <AnimatedRoute><Page /></AnimatedRoute>
}

export const Route = createFileRoute('/docs/config/documents')({
  component: ConfigDocumentsComponent,
})
