import Switch from '@/component/v2/switch';
import { authAPI, type User } from '@/auth/api';
import { useSession } from '@/auth/context';
import type { IssuedProxyCredential, ProxyCredential, UpstreamCredential } from '@/auth/proxy';
import { listInbounds } from '@/api/inbounds';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardHeader } from '@/component/v2/card';
import { confirmAction } from '@/component/v2/confirmation';
import { DateTimeField } from '@/component/v2/date-time-field';
import { Input } from '@/component/v2/input';
import { MultiSelectChips } from '@/component/v2/multi-select';
import { Select } from '@/component/v2/select';
import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { IssuedSecret } from './secret';

const proxyProtocols = [{ value: 'http', label: 'HTTP' }, { value: 'socks5', label: 'SOCKS5' }, { value: 'yuubinsya', label: 'Yuubinsya' }, { value: 'hysteria2', label: 'Hysteria2' }, { value: 'sstp', label: 'SSTP' }];

export function ProxyCredentials() {
    const { t } = useTranslation('auth'); const session = useSession()!;
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 60000); return () => clearInterval(timer); }, []);
    const canManage = session.principal.permissions.includes('proxy-credentials:manage');
    const [owner, setOwner] = useState(session.principal.userId);
    const [name, setName] = useState(''); const [expires, setExpires] = useState('');
    const [permanent, setPermanent] = useState(true);
    const [inbounds, setInbounds] = useState<string[]>([]); const [protocols, setProtocols] = useState<string[]>([]);
    const [issued, setIssued] = useState<IssuedProxyCredential | null>(null);
    const [busy, setBusy] = useState(false); const [error, setError] = useState('');
    const { data: users } = useSWR(canManage && session.principal.permissions.includes('users:manage') ? 'auth-users' : null, () => authAPI<User[]>('GET', '/users'));
    const { data: entries } = useSWR(session.principal.permissions.includes('inbounds:read') ? 'proxy-inbounds' : null, () => listInbounds({ pageSize: 1000 }));
    const { data, error: loadError, mutate } = useSWR(['proxy-credentials', owner], () => authAPI<ProxyCredential[]>('GET', `/proxy-credentials?owner=${encodeURIComponent(owner)}`));
    const run = async (operation: () => Promise<void>) => {
        setBusy(true); setError('');
        try { await operation(); await mutate(); } catch { setError(t('requestFailed')); } finally { setBusy(false); }
    };
    const create = (event: FormEvent) => {
        event.preventDefault();
        if (!name.trim() || (!permanent && (!Number.isFinite(Date.parse(expires)) || Date.parse(expires) <= Date.now()))) { setError(t('proxyCredentialValidation')); return; }
        void run(async () => { setIssued(await authAPI<IssuedProxyCredential>('POST', '/proxy-credentials', { owner, name, inbounds, protocols, expiresAt: permanent ? 0 : Math.floor(Date.parse(expires) / 1000) })); setName(''); });
    };
    return <Card><CardHeader><h2 className="m-0 font-medium">{t('proxyCredentials')}</h2></CardHeader><CardBody className="space-y-4">
        <p className="text-sm text-ui-muted">{t('proxyCredentialsHelp')}</p>
        <form className="space-y-4" onSubmit={create}>
            <div className="flex flex-wrap items-end gap-3">
                {users && <div className="min-w-48"><Select ariaLabel={t('owner')} value={owner} onValueChange={setOwner} items={users.filter(user => !user.disabled).map(user => ({ value: user.id, label: user.login }))} disabled={busy} /></div>}
                <label className="min-w-0 flex-1 space-y-2"><span>{t('credentialName')}</span><Input value={name} onChange={event => setName(event.target.value)} required maxLength={128} disabled={busy} /></label>
            </div>
            <fieldset className="space-y-2"><legend className="text-sm font-medium">{t('expires')}</legend><div className="flex flex-wrap items-center gap-x-4 gap-y-2"><Switch label={t('permanentCredential')} checked={permanent} onCheckedChange={setPermanent} disabled={busy} />{!permanent && <div className="min-w-56 flex-1 sm:max-w-xs"><DateTimeField ariaLabel={t('expires')} value={expires} onChange={setExpires} required disabled={busy} /></div>}</div></fieldset>
            <fieldset className="space-y-2"><legend className="text-sm font-medium">{t('protocols')}</legend><p className="text-xs text-ui-muted">{t('credentialScopeHelp')}</p><MultiSelectChips value={protocols} onChange={setProtocols} disabled={busy} options={proxyProtocols} /></fieldset>
            {entries && <fieldset className="space-y-2"><legend className="text-sm font-medium">{t('inbounds')}</legend><MultiSelectChips value={inbounds} onChange={setInbounds} disabled={busy} options={entries.items.filter(entry => ['http', 'socks5', 'mixed', 'yuubinsya', 'hysteria2', 'sstp'].includes(entry.protocol.type)).map(entry => ({ value: entry.id, label: entry.name }))} /></fieldset>}
            <Button type="submit" variant="primary" disabled={busy}>{t('createProxyCredential')}</Button>
        </form>
        {(error || loadError) && <p role="alert" className="text-sm text-ui-danger">{error || t('requestFailed')}</p>}
        <div className="space-y-3">{data?.map(item => <section key={item.id} className="space-y-2 rounded-ui-md border border-ui-border p-4">
            <div className="flex flex-wrap justify-between gap-2"><h3 className="m-0 font-medium">{item.name}</h3><span className="text-xs text-ui-muted">{t(item.revoked ? 'revoked' : item.expiresAt && item.expiresAt * 1000 <= now ? 'expired' : 'active')}</span></div>
            <p className="break-all text-xs text-ui-muted">{item.id}</p><p className="text-sm">{item.protocols?.join(', ') || t('allProtocols')} · {item.expiresAt ? new Date(item.expiresAt * 1000).toLocaleString() : t('never')}</p>
            <p className="text-xs text-ui-muted">{item.inbounds?.map(id => entries?.items.find(entry => entry.id === id)?.name || id).join(', ') || t('allAuthorizedInbounds')}</p>
            <div className="flex flex-wrap gap-2">
                <Button disabled={busy || item.revoked || !!item.expiresAt && item.expiresAt * 1000 <= now} onClick={() => void run(async () => { if (await confirmAction(t('rotateProxyCredentialConfirm'))) setIssued(await authAPI<IssuedProxyCredential>('POST', `/proxy-credentials/${item.id}/rotate`)); })}>{t('rotate')}</Button>
                <Button variant="outline-danger" disabled={busy || item.revoked} onClick={() => void run(async () => { if (await confirmAction(t('revokeProxyCredentialConfirm'))) await authAPI('POST', `/proxy-credentials/${item.id}/revoke`); })}>{t('revoke')}</Button>
                <Button variant="outline-danger" disabled={busy} onClick={() => void run(async () => { if (await confirmAction(t('deleteProxyCredentialConfirm'))) await authAPI('DELETE', `/proxy-credentials/${item.id}`); })}>{t('delete')}</Button>
            </div>
        </section>)}</div>
    </CardBody>{issued && <IssuedSecret value={{ ...issued, kind: 'proxy', scopes: [...(issued.protocols || []), ...(issued.inbounds || [])] }} onClose={() => setIssued(null)} />}</Card>;
}

export function UpstreamCredentials() {
    const { t } = useTranslation('auth');
    const { data, error: loadError, mutate } = useSWR('upstream-credentials', () => authAPI<UpstreamCredential[]>('GET', '/upstream-credentials'));
    const [editing, setEditing] = useState<UpstreamCredential | null>(null);
    const [name, setName] = useState(''); const [type, setType] = useState<UpstreamCredential['type']>('password');
    const [username, setUsername] = useState(''); const [password, setPassword] = useState('');
    const [busy, setBusy] = useState(false); const [error, setError] = useState('');
    const reset = () => { setEditing(null); setName(''); setUsername(''); setPassword(''); setType('password'); };
    const run = async (operation: () => Promise<void>) => { setBusy(true); setError(''); try { await operation(); await mutate(); } catch { setError(t('requestFailed')); } finally { setBusy(false); } };
    const save = (event: FormEvent) => {
        event.preventDefault(); void run(async () => { await authAPI(editing ? 'PUT' : 'POST', `/upstream-credentials${editing ? `/${editing.id}` : ''}`, { name, type, username: type === 'username-password' ? username : '', password }); reset(); });
    };
    return <Card><CardHeader><h2 className="m-0 font-medium">{t('upstreamCredentials')}</h2></CardHeader><CardBody className="space-y-4">
        <p className="text-sm text-ui-muted">{t('upstreamCredentialsHelp')}</p>
        <form className="flex flex-wrap items-end gap-3" onSubmit={save}>
            <label className="min-w-0 flex-1 space-y-2"><span>{t('credentialName')}</span><Input value={name} onChange={event => setName(event.target.value)} required maxLength={128} disabled={busy} /></label>
            <div className="min-w-48"><Select ariaLabel={t('credentialType')} value={type} onValueChange={value => setType(value as UpstreamCredential['type'])} items={[{ value: 'password', label: t('password') }, { value: 'username-password', label: t('usernamePassword') }]} disabled={busy || !!editing} /></div>
            {type === 'username-password' && <label className="space-y-2"><span>{t('loginName')}</span><Input value={username} onChange={event => setUsername(event.target.value)} maxLength={255} disabled={busy} /></label>}
            <label className="space-y-2"><span>{t('password')}</span><Input type="password" autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} required maxLength={4096} disabled={busy} /></label>
            <Button type="submit" variant="primary" disabled={busy}>{t(editing ? 'replaceCredential' : 'createUpstreamCredential')}</Button>{editing && <Button disabled={busy} onClick={reset}>{t('cancel')}</Button>}
        </form>
        {(error || loadError) && <p role="alert" className="text-sm text-ui-danger">{error || t('requestFailed')}</p>}
        <div className="space-y-3">{data?.map(item => <section key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-ui-md border border-ui-border p-4"><div className="min-w-0"><h3 className="m-0 font-medium">{item.name}</h3><p className="break-all text-xs text-ui-muted">{item.type} · {item.id}</p></div><div className="flex flex-wrap gap-2"><Button disabled={busy} onClick={() => { setEditing(item); setName(item.name); setType(item.type); setUsername(''); setPassword(''); }}>{t('replaceCredential')}</Button><Button variant="outline-danger" disabled={busy} onClick={() => void run(async () => { if (await confirmAction(t('deleteUpstreamCredentialConfirm'))) await authAPI('DELETE', `/upstream-credentials/${item.id}`); if (editing?.id === item.id) reset(); })}>{t('delete')}</Button></div></section>)}</div>
    </CardBody></Card>;
}
