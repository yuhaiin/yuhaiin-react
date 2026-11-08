import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmModal } from './confirm';

type Request = { message: string; resolve: (accepted: boolean) => void };
let present: ((request: Request) => void) | undefined;
let dismiss: (() => void) | undefined;

/** Window event: answer every open confirmation with "no" (Back while a dialog is open). */
export const DISMISS_CONFIRMATIONS = 'yuhaiin:dismiss-confirmations';
if (typeof window !== 'undefined') window.addEventListener(DISMISS_CONFIRMATIONS, () => dismiss?.());

/** Application confirmations are asynchronous; no action runs before approval. */
export function confirmAction(message: string): Promise<boolean> {
    return new Promise(resolve => {
        if (present) present({ message, resolve });
        else resolve(false);
    });
}

export function ConfirmationHost() {
    const { t } = useTranslation('common');
    const [requests, setRequests] = useState<Request[]>([]);
    const pending = useRef(new Set<Request>());
    useEffect(() => {
        const outstanding = pending.current;
        present = request => { outstanding.add(request); setRequests(previous => [...previous, request]); };
        dismiss = () => { outstanding.forEach(request => request.resolve(false)); outstanding.clear(); setRequests([]); };
        return () => { present = undefined; dismiss = undefined; outstanding.forEach(request => request.resolve(false)); outstanding.clear(); };
    }, []);
    const [finished] = useState(() => new WeakSet<Request>());
    const finish = (accepted: boolean) => {
        const current = requests[0];
        if (!current) return;
        if (finished.has(current)) return;
        finished.add(current);
        pending.current.delete(current);
        current.resolve(accepted);
        setRequests(previous => previous.slice(1));
    };
    return <ConfirmModal show={requests.length > 0} title={t('action.confirm')} content={requests[0]?.message}
        onOk={() => finish(true)} onHide={() => finish(false)} />;
}
