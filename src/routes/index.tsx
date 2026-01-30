import { createFileRoute } from '@tanstack/react-router'
import HomePage from '../docs/home/page'
import { AnimatedRoute } from '@/component/AnimatedRoute'

function HomeIndexComponent() {
    return <AnimatedRoute><HomePage /></AnimatedRoute>
}

export const Route = createFileRoute('/')({
    component: HomeIndexComponent,
})
