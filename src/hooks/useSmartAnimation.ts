import { useState } from 'react';

const normalize = (path: string) => path.replace(/\/+$/, '') || '/';

// Keep the direction for the entire transition, including unrelated rerenders.
// Updating during render avoids a previous-route effect resetting it mid-animation.
export function useSmartAnimation(location: string, routeOrder: readonly string[]) {
    const path = normalize(location);
    const [transition, setTransition] = useState({ path, direction: 0 });
    if (path === transition.path) return transition.direction;

    const previous = routeOrder.findIndex(route => normalize(route) === transition.path);
    const next = routeOrder.findIndex(route => normalize(route) === path);
    const direction = next >= previous ? 1 : -1;
    setTransition({ path, direction });
    return direction;
}
