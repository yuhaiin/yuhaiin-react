import { authAPI } from '@/auth/api';
import { clearSession, getSession } from '@/auth/session';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardHeader } from '@/component/v2/card';
import { confirmAction } from '@/component/v2/confirmation';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

export interface LoginSession { id: string; createdAt: number; expiresAt: number; lastSeen: number; userAgent: string; remoteAddr: string; authMethod: string; current: boolean }
export function Sessions() {
    const { t } = useTranslation('auth');
    const { data, error: loadError, mutate } = useSWR('auth-sessions', () => authAPI<LoginSession[]>('GET', '/sessions'), { refreshInterval: 60000 });
    const [busy, setBusy] = useState(false); const [error, setError] = useState('');
    const revoke = async (item: LoginSession) => {
        if (!await confirmAction(t(item.current ? 'endCurrentSessionConfirm' : 'endSessionConfirm'))) return;
        const session = getSession(); setBusy(true); setError('');
        try {
            await authAPI('DELETE', `/sessions/${encodeURIComponent(item.id)}`);
            if (item.current && session === getSession()) clearSession(); else await mutate();
        } catch { setError(t('requestFailed')); } finally { setBusy(false); }
    };
    const date = (value: number) => value ? new Date(value * 1000).toLocaleString() : t('unknownDevice');
    return <Card><CardHeader><h2 className="font-medium">{t('sessions')}</h2><Button disabled={busy} onClick={() => void mutate()}>{t('refresh')}</Button></CardHeader><CardBody className="space-y-3">
        {(error || loadError) && <p role="alert" className="text-sm text-ui-danger">{error || t('requestFailed')}</p>}
        {!data && !loadError && <p role="status">{t('loadingSessions')}</p>}
        {data?.length === 0 && <p className="text-sm text-ui-muted">{t('noSessions')}</p>}
        {data?.map(item => <section key={item.id} className="space-y-2 rounded-ui-md border border-ui-border p-4">
            <div className="flex flex-wrap items-start justify-between gap-3"><p className="min-w-0 flex-1 break-words text-sm">{item.userAgent || t('unknownDevice')}</p>{item.current && <span className="text-sm text-ui-primary">{t('currentSession')}</span>}</div>
            <p className="break-all text-xs text-ui-muted">{item.remoteAddr || t('unknownDevice')} · {item.authMethod}</p>
            <dl className="grid gap-2 text-xs text-ui-muted sm:grid-cols-3"><div><dt>{t('sessionCreated')}</dt><dd>{date(item.createdAt)}</dd></div><div><dt>{t('lastActive')}</dt><dd>{date(item.lastSeen)}</dd></div><div><dt>{t('expires')}</dt><dd>{date(item.expiresAt)}</dd></div></dl>
            <Button permission="identity:read" variant="outline-danger" disabled={busy} onClick={() => void revoke(item)}>{t('endSession')}</Button>
        </section>)}
    </CardBody></Card>;
}
