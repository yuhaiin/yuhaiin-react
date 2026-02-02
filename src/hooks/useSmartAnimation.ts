import { useLocation } from "wouter";
import { useState } from "react";

export const ROUTE_ORDER = [
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

    // Try finding the closest match (prefix)
    let bestMatchLength = 0;
    for (let i = 0; i < ROUTE_ORDER.length; i++) {
        const route = ROUTE_ORDER[i];
        if (normalizedPath.startsWith(route) && route.length > bestMatchLength) {
            bestMatchLength = route.length;
            index = i;
        }
    }
    return index !== -1 ? index : 0;
};

export function useSmartAnimation() {
    const [location] = useLocation();

    // We need to store the *previous* location to compare.
    const [prevPath, setPrevPath] = useState(location);
    const [direction, setDirection] = useState(0);

    if (prevPath !== location) {
        const prevIndex = getRouteIndex(prevPath);
        const currentIndex = getRouteIndex(location);
        setDirection(currentIndex > prevIndex ? 1 : -1);
        setPrevPath(location);
    }

    return { direction, location };
}
