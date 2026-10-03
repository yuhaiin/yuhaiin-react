import { useMemo, useState, useSyncExternalStore, type ReactNode } from 'react';
import { SWRConfig } from 'swr';
import { AuthTokenKey, getApiUrl } from './apiurl';

function snapshot() {
    return JSON.stringify([getApiUrl(), localStorage.getItem(AuthTokenKey)]);
}
function subscribe(update: () => void) {
    window.addEventListener('storage', update);
    window.addEventListener('local-storage', update);
    return () => {
        window.removeEventListener('storage', update);
        window.removeEventListener('local-storage', update);
    };
}

/** Retain only the current controller/session cache; old requests cannot populate the new cache. */
export function ApiCacheBoundary({ children }: { children: ReactNode }) {
    const scope = useSyncExternalStore(subscribe, snapshot, snapshot);
    const [boundary, setBoundary] = useState({ scope, version: 0 });
    if (boundary.scope !== scope) setBoundary({ scope, version: boundary.version + 1 });
    const cache = useMemo(() => ({ scope, values: new Map() }), [scope]);
    return <SWRConfig key={boundary.version} value={{
        provider: () => cache.values,
        revalidateOnFocus: false,
        dedupingInterval: 2000,
        shouldRetryOnError: false,
    }}>{children}</SWRConfig>;
}
