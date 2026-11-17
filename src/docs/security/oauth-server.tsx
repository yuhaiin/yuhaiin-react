import { usePermission } from '@/auth/context';
import { grantActive, oauthServer, type OAuthClient, type OAuthClientType, type OAuthGrant, type OAuthServerOverview, type OAuthServerSettings, type OAuthToken } from '@/auth/oauth-server';
import { Badge } from '@/component/v2/badge';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardHeader } from '@/component/v2/card';
import { useClipboard } from '@/component/v2/clipboard';
import { confirmAction } from '@/component/v2/confirmation';
import { Input, Textarea } from '@/component/v2/input';
import { MultiSelectChips } from '@/component/v2/multi-select';
import { Select } from '@/component/v2/select';
import { SwitchCard } from '@/component/v2/switch';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { GrantStatus, ScopeList } from './authorized-apps';
import { PermissionPicker } from './permission-picker';
import { IssuedSecret } from './secret';

const date = (value: number, never: string) => value ? new Date(value * 1000).toLocaleString() : never;

function CopyValue({ label, value }: { label: string; value?: string }) {
    const { t } = useTranslation('auth');
    const clipboard = useClipboard({ usePromptAsFallback: true });
    if (!value) return null;
    return <div className="grid min-w-0 gap-1 sm:grid-cols-[12rem_minmax(0,1fr)_auto] sm:items-center">
        <dt className="text-sm text-ui-muted">{label}</dt>
        <dd className="m-0 min-w-0"><code className="break-all text-sm">{value}</code></dd>
        <dd className="m-0"><Button size="sm" onClick={() => void clipboard.copy(value)}>{t(clipboard.copied ? 'copied' : 'copy')}</Button>{clipboard.manualCopyModal}</dd>
    </div>;
}

/**
 * Administration of Yuhaiin's OAuth 2.1 Authorization Server: settings,
 * registered applications, every grant, and the MCP resource. There is no MCP
 * specific OAuth logic here; MCP is one resource of the shared server.
 */
export function OAuthServerAdmin() {
    const { data: overview, error, mutate } = useSWR('oauth-server-overview', oauthServer.overview);
    const { t } = useTranslation('auth');
    if (error) return <Card><CardBody><p role="alert" className="text-sm text-ui-danger">{t('requestFailed')}</p></CardBody></Card>;
    if (!overview) return <p role="status" className="text-sm text-ui-muted">{t('oauthServer.loading')}</p>;
    return <>
        <ServerSettings key={overview.settings.revision} overview={overview} onSaved={() => void mutate()} />
        <MCPResource overview={overview} />
        <Clients overview={overview} />
        <AllGrants />
    </>;
}

function ServerSettings({ overview, onSaved }: { overview: OAuthServerOverview; onSaved: () => void }) {
    const { t } = useTranslation('auth');
    const writable = usePermission('security:write');
    const [draft, setDraft] = useState<OAuthServerSettings>(overview.settings);
    const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [notice, setNotice] = useState('');
    const set = <K extends keyof OAuthServerSettings>(key: K, value: OAuthServerSettings[K]) => { setDraft(current => ({ ...current, [key]: value })); setNotice(''); };
    const save = async (event: FormEvent) => {
        event.preventDefault(); setBusy(true); setError('');
        try { await oauthServer.saveSettings(draft); setNotice(t('oauthServer.saved')); onSaved(); }
        catch (cause) { setError(t((cause as { code?: number })?.code === 409 ? 'oauthServer.conflict' : 'oauthServer.invalidSettings')); }
        finally { setBusy(false); }
    };
    const minutes = (seconds: number) => String(Math.round(seconds / 60));
    const days = (seconds: number) => String(Math.round(seconds / 86400));
    return <Card><CardHeader><h2 className="m-0 font-medium">{t('oauthServer.title')}</h2></CardHeader><CardBody>
        <form className="space-y-4" onSubmit={event => void save(event)}>
            <p className="text-sm text-ui-muted">{t('oauthServer.hint')}</p>
            <fieldset disabled={!writable || busy} className="min-w-0 space-y-4">
                <SwitchCard label={t('oauthServer.enabled')} description={t('oauthServer.enabledHint')} checked={draft.enabled} onCheckedChange={value => set('enabled', value)} />
                <label className="block space-y-2"><span className="text-sm font-medium">{t('oauthServer.issuer')}</span>
                    <Input value={draft.issuer} placeholder={window.location.origin} onChange={event => set('issuer', event.target.value)} />
                    <span className="block text-xs text-ui-muted">{t('oauthServer.issuerHint')}</span></label>
                {!draft.issuer && <Button type="button" onClick={() => set('issuer', window.location.origin)}>{t('oauthServer.useThisOrigin')}</Button>}
                <SwitchCard label={t('oauthServer.dynamicRegistration')} description={t('oauthServer.dynamicRegistrationHint')} checked={draft.dynamicRegistration} onCheckedChange={value => set('dynamicRegistration', value)} />
                <div className="space-y-1">
                    <p className="m-0 text-sm font-medium">{t('oauthServer.resources')}</p>
                    {overview.resources.map(resource => <SwitchCard key={resource.id} label={resource.name} description={resource.uri ?? resource.id}
                        checked={!draft.disabledResources.includes(resource.id)}
                        onCheckedChange={on => set('disabledResources', on ? draft.disabledResources.filter(id => id !== resource.id) : [...draft.disabledResources, resource.id])} />)}
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                    <label className="block space-y-2"><span className="text-sm">{t('oauthServer.accessTokenMinutes')}</span><Input type="number" min={5} max={60} value={minutes(draft.accessTokenTtl)} onChange={event => set('accessTokenTtl', Number(event.target.value) * 60)} /></label>
                    <label className="block space-y-2"><span className="text-sm">{t('oauthServer.refreshTokenDays')}</span><Input type="number" min={1} max={365} value={days(draft.refreshTokenTtl)} onChange={event => set('refreshTokenTtl', Number(event.target.value) * 86400)} /></label>
                    <label className="block space-y-2"><span className="text-sm">{t('oauthServer.grantDays')}</span><Input type="number" min={1} max={365} value={days(draft.grantTtl)} onChange={event => set('grantTtl', Number(event.target.value) * 86400)} /></label>
                </div>
            </fieldset>
            {overview.metadataUrl && <dl className="m-0 space-y-2 rounded-ui-md border border-ui-border p-3">
                <CopyValue label={t('oauthServer.metadataUrl')} value={overview.metadataUrl} />
                <CopyValue label={t('oauthServer.authorizationEndpoint')} value={overview.authorizationEndpoint} />
                <CopyValue label={t('oauthServer.tokenEndpoint')} value={overview.tokenEndpoint} />
                <CopyValue label={t('oauthServer.revocationEndpoint')} value={overview.revocationEndpoint} />
                <CopyValue label={t('oauthServer.registrationEndpoint')} value={overview.registrationEndpoint} />
            </dl>}
            {error && <p role="alert" className="text-sm text-ui-danger">{error}</p>}
            {notice && <p role="status" className="text-sm text-ui-success">{notice}</p>}
            <Button type="submit" variant="primary" permission="security:write" disabled={busy}>{t('save')}</Button>
        </form>
    </CardBody></Card>;
}

function MCPResource({ overview }: { overview: OAuthServerOverview }) {
    const { t } = useTranslation('auth');
    const resource = overview.resources.find(item => item.id === 'mcp');
    const { data: grants } = useSWR(resource ? 'oauth-all-grants' : null, () => oauthServer.grants(true), { refreshInterval: 60000 });
    if (!resource) return null;
    const connected = (grants ?? []).filter(grant => grant.resourceId === 'mcp' && grantActive(grant));
    const active = overview.settings.enabled && resource.enabled && Boolean(overview.settings.issuer);
    return <Card><CardHeader><h2 className="m-0 font-medium">{t('oauthServer.mcpTitle')}</h2><Badge variant={active ? 'success' : 'muted'}>{t(active ? 'oauthServer.status.enabled' : 'oauthServer.status.disabled')}</Badge></CardHeader><CardBody className="space-y-4">
        <p className="text-sm text-ui-muted">{t('oauthServer.mcpHint')}</p>
        {overview.settings.issuer ? <dl className="m-0 space-y-2">
            <CopyValue label={t('oauthServer.mcpEndpoint')} value={resource.uri} />
            <CopyValue label={t('oauthServer.issuer')} value={overview.settings.issuer} />
            <CopyValue label={t('oauthServer.resourceMetadata')} value={resource.metadataUrl} />
        </dl> : <p className="text-sm text-ui-warning">{t('oauthServer.issuerRequired')}</p>}
        <div className="space-y-2"><p className="m-0 text-sm font-medium">{t('oauthServer.supportedScopes')}</p><ScopeList scopes={resource.scopes} /></div>
        <div className="space-y-2">
            <p className="m-0 text-sm font-medium">{t('oauthServer.connectedClients')}</p>
            {connected.length === 0 && <p className="text-sm text-ui-muted">{t('oauthServer.noConnectedClients')}</p>}
            <ul className="space-y-2">{connected.map(grant => <li key={grant.id} className="flex flex-wrap items-center justify-between gap-2 rounded-ui-md border border-ui-border px-3 py-2 text-sm">
                <span className="min-w-0 break-words"><strong>{grant.clientName}</strong> · {grant.userLogin}</span>
                <span className="text-xs text-ui-muted">{t('lastActive')}: {date(grant.lastUsedAt, t('oauthServer.never'))}</span>
            </li>)}</ul>
        </div>
    </CardBody></Card>;
}

interface ClientDraft { name: string; type: OAuthClientType; redirectUris: string; resources: string[]; scopes: string[]; clientUri: string }
const emptyDraft: ClientDraft = { name: '', type: 'public', redirectUris: '', resources: [], scopes: [], clientUri: '' };
const lines = (value: string) => value.split('\n').map(line => line.trim()).filter(Boolean);

function Clients({ overview }: { overview: OAuthServerOverview }) {
    const { t } = useTranslation('auth');
    const writable = usePermission('security:write');
    const { data: clients, error: loadError, mutate } = useSWR('oauth-clients', oauthServer.clients);
    const [draft, setDraft] = useState<ClientDraft>(emptyDraft);
    const [secret, setSecret] = useState<{ id: string; secret: string; scopes: string[] } | null>(null);
    const [busy, setBusy] = useState(false); const [error, setError] = useState('');
    const resources = draft.resources.length ? overview.resources.filter(r => draft.resources.includes(r.id)) : overview.resources;
    const available = [...new Set(resources.flatMap(r => r.scopes))];
    const run = async (operation: () => Promise<void>) => {
        setBusy(true); setError('');
        try { await operation(); await mutate(); }
        catch (cause) { const code = (cause as { code?: number })?.code; setError(t(code === 400 ? 'oauthServer.invalidClient' : 'requestFailed')); }
        finally { setBusy(false); }
    };
    const create = (event: FormEvent) => {
        event.preventDefault();
        void run(async () => {
            const created = await oauthServer.createClient({ name: draft.name.trim(), type: draft.type, redirectUris: lines(draft.redirectUris), resources: draft.resources, scopes: draft.scopes.filter(s => available.includes(s)), clientUri: draft.clientUri.trim(), disabled: false });
            if (created.secret) setSecret({ id: created.id, secret: created.secret, scopes: created.scopes });
            setDraft(emptyDraft);
        });
    };
    const update = (client: OAuthClient, changes: Partial<OAuthClient>) => run(async () => {
        const next = { ...client, ...changes };
        await oauthServer.updateClient(client.id, { name: next.name, redirectUris: next.redirectUris, scopes: next.scopes, resources: next.resources, clientUri: next.clientUri, disabled: next.disabled });
    });
    const remove = async (client: OAuthClient) => {
        if (!await confirmAction(t('oauthServer.deleteClientConfirm', { name: client.name }))) return;
        await run(() => oauthServer.deleteClient(client.id).then(() => undefined));
    };
    return <Card><CardHeader><h2 className="m-0 font-medium">{t('oauthServer.applications')}</h2><Button disabled={busy} onClick={() => void mutate()}>{t('refresh')}</Button></CardHeader><CardBody className="space-y-5">
        {writable && <form onSubmit={create} className="space-y-4 rounded-ui-md border border-ui-border p-4">
            <p className="m-0 font-medium">{t('oauthServer.registerApplication')}</p>
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2"><span className="text-sm">{t('oauthServer.applicationName')}</span><Input required maxLength={100} value={draft.name} onChange={event => setDraft({ ...draft, name: event.target.value })} /></label>
                <div className="space-y-2"><span className="block text-sm">{t('oauthServer.clientTypeLabel')}</span><Select ariaLabel={t('oauthServer.clientTypeLabel')} value={draft.type} onValueChange={value => setDraft({ ...draft, type: value as OAuthClientType })}
                    items={[{ value: 'public', label: t('oauthServer.clientType.public') }, { value: 'confidential', label: t('oauthServer.clientType.confidential') }]} /></div>
            </div>
            <label className="block space-y-2"><span className="text-sm">{t('oauthServer.redirectUris')}</span><Textarea required rows={3} value={draft.redirectUris} placeholder="https://app.example.com/callback" onChange={event => setDraft({ ...draft, redirectUris: event.target.value })} /><span className="block text-xs text-ui-muted">{t('oauthServer.redirectUrisHint')}</span></label>
            <label className="block space-y-2"><span className="text-sm">{t('oauthServer.website')}</span><Input value={draft.clientUri} placeholder="https://app.example.com" onChange={event => setDraft({ ...draft, clientUri: event.target.value })} /></label>
            <div className="space-y-2"><span className="block text-sm">{t('oauthServer.resources')}</span>
                <MultiSelectChips value={draft.resources} onChange={value => setDraft({ ...draft, resources: value })} options={overview.resources.map(r => ({ value: r.id, label: r.name }))} />
                <span className="block text-xs text-ui-muted">{t('oauthServer.resourcesHint')}</span></div>
            <PermissionPicker legend={t('oauthServer.allowedScopes')} permissions={available} value={draft.scopes} onChange={scopes => setDraft({ ...draft, scopes })} />
            <p className="text-xs text-ui-muted">{t('oauthServer.allowedScopesHint')}</p>
            <Button type="submit" variant="primary" permission="security:write" disabled={busy || !draft.name.trim() || !lines(draft.redirectUris).length}>{t('oauthServer.register')}</Button>
        </form>}
        {(error || loadError) && <p role="alert" className="text-sm text-ui-danger">{error || t('requestFailed')}</p>}
        {clients?.length === 0 && <p className="text-sm text-ui-muted">{t('oauthServer.noApplications')}</p>}
        <div className="space-y-3">{clients?.map(client => <section key={client.id} className="space-y-3 rounded-ui-md border border-ui-border p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1"><p className="m-0 break-words font-medium">{client.name}</p><code className="break-all text-xs text-ui-muted">{client.id}</code></div>
                <div className="flex flex-wrap gap-1.5">
                    <Badge>{t(`oauthServer.clientType.${client.type}`)}</Badge>
                    <Badge variant={client.registration === 'dynamic' ? 'warning' : 'info'}>{t(client.registration === 'dynamic' ? 'oauthServer.selfRegistered' : 'oauthServer.registeredByAdmin')}</Badge>
                    <Badge variant={client.disabled ? 'muted' : 'success'}>{t(client.disabled ? 'oauthServer.status.disabled' : 'oauthServer.status.enabled')}</Badge>
                </div>
            </div>
            <dl className="grid gap-2 text-xs text-ui-muted sm:grid-cols-3">
                <div><dt>{t('sessionCreated')}</dt><dd>{date(client.createdAt, t('oauthServer.never'))}</dd></div>
                <div><dt>{t('oauthServer.activeGrants')}</dt><dd>{client.activeGrants}</dd></div>
                <div><dt>{t('oauthServer.resources')}</dt><dd>{client.resources.join(', ')}</dd></div>
            </dl>
            <div className="space-y-1"><p className="m-0 text-xs text-ui-muted">{t('oauthServer.redirectUris')}</p><ul className="m-0 space-y-0.5 text-sm">{client.redirectUris.map(uri => <li key={uri} className="break-all"><code>{uri}</code></li>)}</ul></div>
            <div className="space-y-1"><p className="m-0 text-xs text-ui-muted">{t('oauthServer.allowedScopes')}</p><ScopeList scopes={client.scopes} /></div>
            <div className="flex flex-wrap gap-2">
                <Button permission="security:write" variant={client.disabled ? 'primary' : 'outline-danger'} disabled={busy} onClick={() => void update(client, { disabled: !client.disabled })}>{t(client.disabled ? 'oauthServer.enableClient' : 'oauthServer.disableClient')}</Button>
                <Button permission="security:write" variant="outline-danger" disabled={busy} onClick={() => void remove(client)}>{t('delete')}</Button>
            </div>
        </section>)}</div>
        {secret && <IssuedSecret value={{ secret: secret.secret, kind: 'oauth-client', userId: secret.id, expiresAt: 0, scopes: secret.scopes }} onClose={() => setSecret(null)} />}
    </CardBody></Card>;
}

function AllGrants() {
    const { t } = useTranslation('auth');
    const { data: grants, error: loadError, mutate } = useSWR('oauth-all-grants', () => oauthServer.grants(true), { refreshInterval: 60000 });
    const [open, setOpen] = useState<string | null>(null);
    const [busy, setBusy] = useState(false); const [error, setError] = useState('');
    const revoke = async (grant: OAuthGrant) => {
        if (!await confirmAction(t('oauthServer.revokeConfirm', { name: grant.clientName }))) return;
        setBusy(true); setError('');
        try { await oauthServer.revokeGrant(grant.id); await mutate(); } catch { setError(t('requestFailed')); } finally { setBusy(false); }
    };
    return <Card><CardHeader><h2 className="m-0 font-medium">{t('oauthServer.grants')}</h2><Button disabled={busy} onClick={() => void mutate()}>{t('refresh')}</Button></CardHeader><CardBody className="space-y-3">
        <p className="text-sm text-ui-muted">{t('oauthServer.grantsHint')}</p>
        {(error || loadError) && <p role="alert" className="text-sm text-ui-danger">{error || t('requestFailed')}</p>}
        {grants?.length === 0 && <p className="text-sm text-ui-muted">{t('oauthServer.noGrants')}</p>}
        {grants?.map(grant => <section key={grant.id} className="space-y-2 rounded-ui-md border border-ui-border p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1"><p className="m-0 break-words font-medium">{grant.clientName} · {grant.userLogin}</p><p className="m-0 break-all text-xs text-ui-muted">{grant.resource}</p></div>
                <GrantStatus grant={grant} />
            </div>
            <ScopeList scopes={grant.scopes} />
            <dl className="grid gap-2 text-xs text-ui-muted sm:grid-cols-4">
                <div><dt>{t('oauthServer.authorizedAt')}</dt><dd>{date(grant.createdAt, t('oauthServer.never'))}</dd></div>
                <div><dt>{t('lastActive')}</dt><dd>{date(grant.lastUsedAt, t('oauthServer.never'))}</dd></div>
                <div><dt>{t('expires')}</dt><dd>{date(grant.expiresAt, t('oauthServer.never'))}</dd></div>
                <div><dt>{t('oauthServer.activeTokens')}</dt><dd>{grant.activeTokens}</dd></div>
            </dl>
            <div className="flex flex-wrap gap-2">
                <Button onClick={() => setOpen(open === grant.id ? null : grant.id)}>{t(open === grant.id ? 'oauthServer.hideTokens' : 'oauthServer.showTokens')}</Button>
                {grantActive(grant) && <Button permission="security:write" variant="outline-danger" disabled={busy} onClick={() => void revoke(grant)}>{t('oauthServer.revokeAccess')}</Button>}
            </div>
            {open === grant.id && <GrantTokens grant={grant.id} />}
        </section>)}
    </CardBody></Card>;
}

function GrantTokens({ grant }: { grant: string }) {
    const { t } = useTranslation('auth');
    const { data, error } = useSWR(['oauth-grant-tokens', grant], () => oauthServer.tokens(grant));
    const [now] = useState(() => Date.now());
    const status = (token: OAuthToken) => token.revoked ? t('oauthServer.status.revoked') : token.expiresAt * 1000 <= now ? t('oauthServer.status.expired') : t('oauthServer.status.active');
    if (error) return <p role="alert" className="text-sm text-ui-danger">{t('requestFailed')}</p>;
    if (!data) return <p role="status" className="text-sm text-ui-muted">{t('oauthServer.loading')}</p>;
    return <div className="overflow-x-auto"><table className="w-full min-w-[32rem] text-left text-xs">
        <thead className="text-ui-muted"><tr><th className="py-1 pr-3">{t('oauthServer.tokenKind')}</th><th className="py-1 pr-3">{t('oauthServer.tokenPrefix')}</th><th className="py-1 pr-3">{t('sessionCreated')}</th><th className="py-1 pr-3">{t('expires')}</th><th className="py-1">{t('oauthServer.statusLabel')}</th></tr></thead>
        <tbody>{data.map(token => <tr key={token.id} className="border-t border-ui-border/50">
            <td className="py-1 pr-3">{t(`oauthServer.tokenKinds.${token.kind}`)}</td><td className="py-1 pr-3"><code>{token.prefix}…</code></td>
            <td className="py-1 pr-3">{date(token.createdAt, '')}</td><td className="py-1 pr-3">{date(token.expiresAt, '')}</td><td className="py-1">{status(token)}</td>
        </tr>)}</tbody>
    </table></div>;
}
