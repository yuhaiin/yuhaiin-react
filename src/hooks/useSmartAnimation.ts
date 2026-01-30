import { useLocation } from '@tanstack/react-router';
import { useRef } from 'react';

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
            if (route === '/' || normalizedPath.length === route.length || normalizedPath[route.length] === '/') {
                bestMatchLength = route.length;
                index = i;
            }
        }
    }
    return index !== -1 ? index : 0; // Default to 0 if not found
};

export function useSmartAnimation() {
    const pathname = useLocation({ select: (location) => location.pathname });
    const prevPathnameRef = useRef(pathname);
    const prevDirectionRef = useRef(0);

    // Calculate direction synchronously
    // If pathname changed since last render (stored in ref)
    if (prevPathnameRef.current !== pathname) {
        const prevIndex = getRouteIndex(prevPathnameRef.current);
        const currentIndex = getRouteIndex(pathname);
        const direction = currentIndex > prevIndex ? 1 : -1;

        // Update refs immediately so they are available for this render cycle and next
        prevPathnameRef.current = pathname;
        prevDirectionRef.current = direction;
        return direction;
    }

    return prevDirectionRef.current;
}
