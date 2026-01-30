import { createFileRoute } from '@tanstack/react-router'
import Page from '@/docs/config/licenses/page'
import { AnimatedRoute } from '@/component/AnimatedRoute'

function ConfigLicensesComponent() {
    return <AnimatedRoute><Page /></AnimatedRoute>
}

export const Route = createFileRoute('/docs/config/licenses')({
  component: ConfigLicensesComponent,
})
