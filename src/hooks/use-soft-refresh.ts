import { useCallback, useRef, useState } from 'react';
import { useSWRConfig } from 'swr';

/** Long enough for the spinner to read as "it did refresh" when the answers are instant. */
const MIN_BUSY_MS = 500;

/**
 * Reloads the data of the mounted page (every active SWR request) without
 * reloading the document: scroll position, open editors and streams stay.
 */
export function useSoftRefresh() {
    const { mutate } = useSWRConfig();
    const [refreshing, setRefreshing] = useState(false);
    const running = useRef(false);
    const refresh = useCallback(async () => {
        if (running.current) return;
        running.current = true;
        setRefreshing(true);
        try {
            await Promise.allSettled([
                mutate(() => true),
                new Promise(resolve => window.setTimeout(resolve, MIN_BUSY_MS)),
            ]);
        } finally {
            running.current = false;
            setRefreshing(false);
        }
    }, [mutate]);
    return { refreshing, refresh };
}
