import { authAPI, type Issued, type Token, type User } from '@/auth/api';
import { useSession } from '@/auth/context';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardHeader } from '@/component/v2/card';
import { confirmAction } from '@/component/v2/confirmation';
import { Input } from '@/component/v2/input';
import { Select } from '@/component/v2/select';
import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { IssuedSecret } from './secret';
const readerScopes = new Set(['nodes:read', 'inbounds:read', 'routes:read', 'resolver:read', 'connections:read', 'gateway:read', 'settings:read', 'metrics:read', 'identity:read', 'tokens:own']);
export function Tokens() {
    const { t } = useTranslation('auth'); const session = useSession()!;
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 60000); return () => clearInterval(timer); }, []);
    const [owner, setOwner] = useState(session.principal.userId);
    const [scopes, setScopes] = useState<string[]>(session.principal.permissions.includes('nodes:read') ? ['nodes:read'] : []);
    const [expires, setExpires] = useState(''); const [issued, setIssued] = useState<Issued | null>(null);
    const [busy, setBusy] = useState(false); const [error, setError] = useState('');
    const { data: users } = useSWR(session.principal.permissions.includes('users:manage') && session.principal.permissions.includes('tokens:manage') ? 'auth-users' : null, () => authAPI<User[]>('GET', '/users'));
    const { data: tokens, error: loadError, mutate } = useSWR(['auth-tokens', owner], () => authAPI<Token[]>('GET', `/tokens?owner=${encodeURIComponent(owner)}`));
    const target = users?.find(user => user.id === owner);
    const available = session.principal.permissions.filter(permission => target?.role !== 'read-only' || readerScopes.has(permission));
    const run = async (operation: () => Promise<void>) => {
        setBusy(true); setError('');
        try { await operation(); await mutate(); } catch { setError(t('requestFailed')); } finally { setBusy(false); }
    };
    const create = (event: FormEvent) => {
        event.preventDefault();
        if (!scopes.length || (expires && (!Number.isFinite(Date.parse(expires)) || Date.parse(expires) <= Date.now()))) { setError(t('tokenValidation')); return; }
        void run(async () => setIssued(await authAPI<Issued>('POST', '/tokens', { owner, scopes, expiresAt: expires ? Math.floor(Date.parse(expires) / 1000) : 0 })));
    };
    return <Card><CardHeader><h2 className="font-medium">{t('tokens')}</h2><Button disabled={busy} onClick={() => void mutate()}>{t('refresh')}</Button></CardHeader><CardBody className="space-y-5">
        <p className="text-sm text-ui-muted">{t('tokenHint')}</p>
        {users && <Select ariaLabel={t('owner')} value={owner} items={users.filter(user => user.enrolled && !user.disabled).map(user => ({ value: user.id, label: user.login }))} disabled={busy} onValueChange={id => { setOwner(id); setScopes([]); }} />}
        <form onSubmit={create} className="space-y-4">
            <fieldset disabled={busy}><legend className="mb-2 text-sm font-medium">{t('scopes')}</legend><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{available.map(scope => <label key={scope} className="flex min-w-0 items-center gap-2 text-sm"><input type="checkbox" checked={scopes.includes(scope)} onChange={event => setScopes(previous => event.target.checked ? [...previous, scope] : previous.filter(item => item !== scope))} /><span className="break-all">{scope}</span></label>)}</div></fieldset>
            <label className="block space-y-2"><span>{t('optionalExpiry')}</span><Input type="datetime-local" value={expires} onChange={event => setExpires(event.target.value)} disabled={busy} /></label>
            <Button type="submit" variant="primary" disabled={busy || !scopes.length}>{t('createToken')}</Button>
        </form>
        {(error || loadError) && <p role="alert" className="text-sm text-ui-danger">{error || t('requestFailed')}</p>}
        {tokens?.length === 0 && <p className="text-sm text-ui-muted">{t('noTokens')}</p>}
        <div className="space-y-3">{tokens?.map(token => {
            const inactive = token.revoked || (token.expiresAt !== 0 && token.expiresAt * 1000 <= now);
            return <section key={token.id} className="space-y-2 rounded-ui-md border border-ui-border p-4" aria-label={token.prefix}>
                <div className="flex flex-wrap justify-between gap-2"><code>{token.prefix}…</code><span className="text-sm text-ui-muted">{t(token.revoked ? 'revoked' : inactive ? 'expired' : 'active')}</span></div>
                <p className="break-all text-xs text-ui-muted">{t('owner')}: {token.userId}</p>
                <p className="break-words text-sm">{token.scopes.join(', ')}</p>
                <p className="text-xs text-ui-muted">{t('expires')}: {token.expiresAt ? new Date(token.expiresAt * 1000).toLocaleString() : t('never')}</p>
                <div className="flex flex-wrap gap-2"><Button disabled={busy || inactive} onClick={() => void run(async () => { if (await confirmAction(t('rotateConfirm'))) setIssued(await authAPI<Issued>('POST', `/tokens/${token.id}/rotate`, {})); })}>{t('rotate')}</Button><Button variant="outline-danger" disabled={busy || inactive} onClick={() => void run(async () => { if (await confirmAction(t('revokeConfirm'))) await authAPI('DELETE', `/tokens/${token.id}`); })}>{t('revoke')}</Button></div>
            </section>;
        })}</div>
    </CardBody>{issued && <IssuedSecret value={issued} onClose={() => setIssued(null)} />}</Card>;
}
