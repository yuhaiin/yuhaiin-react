import { useEffect, useId, useRef } from 'react';
import { navigation } from './navigation';

/**
 * While `open`, the modal owns one same-URL history entry, so Android/browser
 * Back closes it instead of leaving the page. Closing the modal by its own
 * controls removes the entry again. Nested modals stack in opening order.
 */
export function useHistoryLayer(open: boolean, onClose: () => void, enabled = true) {
    const id = useId();
    const close = useRef(onClose);
    useEffect(() => { close.current = onClose; });
    useEffect(() => {
        if (!open || !enabled) return;
        const index = navigation.pushLayer(id);
        let active = true;
        const unsubscribe = navigation.subscribe(() => {
            if (active && navigation.current.index < index) {
                active = false;
                close.current();
            }
        });
        return () => { active = false; unsubscribe(); navigation.releaseLayer(id); };
    }, [open, enabled, id]);
}
