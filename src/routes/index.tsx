import { createFileRoute } from '@tanstack/react-router'
import HomePage from '../docs/home/page'

export const Route = createFileRoute('/')({
    component: HomePage,
})
