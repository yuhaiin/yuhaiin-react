import { createRootRoute, Outlet, useLocation } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { GlobalToastProvider as GlobalToastProviderv2 } from '../component/v2/toast'
import NavBarContainer from '../docs/nav/NavBarContainer'
import './root.css'

interface AndroidInterface {
    setRefreshEnabled?: (enabled: boolean) => void
}

declare global {
    interface Window {
        Android?: AndroidInterface
    }
}

const ROUTE_ORDER = [
    '/',
    '/docs/group',
    '/docs/group/subscribe',
    '/docs/group/publish',
    '/docs/group/activates',
    '/docs/inbound',
    '/docs/bypass',
    '/docs/bypass/list',
    '/docs/bypass/tag',
    '/docs/bypass/resolver',
    '/docs/bypass/test',
    '/docs/bypass/block',
    '/docs/connections/v2',
    '/docs/connections/history',
    '/docs/connections/failed',
    '/docs/config',
    '/docs/webui',
    '/docs/config/backup',
    '/docs/config/log',
    '/docs/config/pprof',
    '/docs/config/documents',
    '/docs/config/licenses',
    '/docs/config/about',
];

const normalizePath = (path: string) => {
    if (path === '/') return '/';
    return path.replace(/\/+$/, '');
};

const getRouteIndex = (path: string) => {
    const normalizedPath = normalizePath(path);

    // Try exact match first
    let index = ROUTE_ORDER.indexOf(normalizedPath);
    if (index !== -1) return index;

    // Try finding the closest match (e.g., sub-routes)
    // We iterate and find the longest prefix match in ROUTE_ORDER
    let bestMatchLength = 0;
    for (let i = 0; i < ROUTE_ORDER.length; i++) {
        const route = ROUTE_ORDER[i];
        // Ensure we match segment boundaries (e.g. /docs/group match /docs/group/sub but not /docs/group-foo)
        // Since we normalized, we check if normalizedPath starts with route + '/'
        // Or if route is prefix and next char is /
        if (normalizedPath.startsWith(route) && route.length > bestMatchLength) {
            // Basic prefix check might be enough if routes are distinct enough
            bestMatchLength = route.length;
            index = i;
        }
    }
    return index !== -1 ? index : 0; // Default to 0 if not found
};

const variants = {
    enter: (direction: number) => ({
        y: direction > 0 ? '100%' : '-100%',
        opacity: 0,
    }),
    center: {
        zIndex: 1,
        y: 0,
        opacity: 1,
    },
    exit: (direction: number) => ({
        zIndex: 0,
        y: direction < 0 ? '100%' : '-100%',
        opacity: 0,
    }),
};

export const Route = createRootRoute({
    component: RootComponent,
})

function RootComponent() {
    const [colorScheme, setColorScheme] = useState<'light' | 'dark' | undefined>(undefined)
    const pathname = useLocation({ select: (location) => location.pathname })

    // We need to track the previous index to determine direction
    // const [direction, setDirection] = useState(0); 
    // State updates might be too late for exit animation context?
    // Actually, popLayout preserves the context. 
    // We can calculate direction "on the fly" but we need the *previous* pathname.

    // Using a ref to store the previous index is safer for render-cycle independent logic,
    // but we need to trigger a render with the new direction for the *entering* component.
    // Actually, simply calculating derived state is fine.

    // We can use a custom hook or just useRef + render loop trick or simply useState.
    // Let's use useState but update it in render or effect? 
    // Better: use a ref for the *previous* pathname and calculate direction during render.

    const [prevPath, setPrevPath] = useState(pathname);
    const [direction, setDirection] = useState(0);

    if (prevPath !== pathname) {
        const prevIndex = getRouteIndex(prevPath);
        const currentIndex = getRouteIndex(pathname);
        setDirection(currentIndex > prevIndex ? 1 : -1);
        setPrevPath(pathname);
    }

    // Note: The above pattern (state update in render) is valid in React for derived state 
    // but allows the component to render with the new direction immediately.

    useEffect(() => {
        window.Android?.setRefreshEnabled?.(!pathname.includes('/docs/config/log'))
    }, [pathname])

    useEffect(() => {
        if (!window.matchMedia) {
            setColorScheme('light')
            return
        }
        const mq = window.matchMedia('(prefers-color-scheme: dark)')
        setColorScheme(mq.matches ? 'dark' : 'light')
        const listener = (evt: MediaQueryListEvent) => setColorScheme(evt.matches ? 'dark' : 'light');
        mq.addEventListener('change', listener);
        return () => mq.removeEventListener('change', listener);
    }, [])

    // data-bs-theme needs to be applied to html, but we are in a component inside body.
    useEffect(() => {
        if (colorScheme) {
            document.documentElement.setAttribute('data-bs-theme', colorScheme)
        }
    }, [colorScheme])

    return (
        <GlobalToastProviderv2>
            {colorScheme &&
                <NavBarContainer>
                    <div className="main-content">
                        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                            <motion.div
                                key={pathname}
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                className='motion-content'
                                transition={{ duration: 0.5, ease: "easeInOut" }} // Slower animation
                                style={{
                                    height: '100%',
                                    width: '100%',
                                    willChange: 'transform, opacity',
                                    position: 'absolute',
                                    overflowY: 'auto',
                                    overflowX: 'hidden',
                                    boxSizing: 'border-box'
                                }}
                            >
                                <Outlet />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </NavBarContainer>
            }
            <TanStackRouterDevtools position="bottom-right" />
        </GlobalToastProviderv2>
    )
}
