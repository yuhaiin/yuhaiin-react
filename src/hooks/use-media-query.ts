import { useCallback, useSyncExternalStore } from 'react';

export function useMediaQuery(query: string) {
    const subscribe = useCallback((onChange: () => void) => {
        if (!window.matchMedia) return () => undefined;
        const media = window.matchMedia(query);
        media.addEventListener('change', onChange);
        return () => media.removeEventListener('change', onChange);
    }, [query]);
    // Environments without matchMedia (tests, very old WebViews) get the wide layout.
    const snapshot = useCallback(() => window.matchMedia?.(query).matches ?? false, [query]);
    return useSyncExternalStore(subscribe, snapshot, () => false);
}
