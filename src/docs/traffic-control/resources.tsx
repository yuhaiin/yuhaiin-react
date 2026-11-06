import Switch from '@/component/v2/switch';
import { StageChangeButton } from "@/component/configuration-change";
import type { Go } from '@/api/generated-contracts';
import { authAPI } from '@/auth/api';
import { usePermission } from '@/auth/context';
import { authScope } from '@/auth/session';
import { createID } from '@/common/id';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardHeader } from '@/component/v2/card';
import { confirmAction } from '@/component/v2/confirmation';
import { blankProfile } from '@/contract/traffic-control';
import { ChevronRight, Plus } from 'lucide-react';
import { useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { ProfileEditor, useProfileSummary } from './rates';
import { QuotaEditor, ResourceID, ResourceLimitsEditor, ResourcePolicyEditor } from './resource-fields';
import { blankLimits, blankResourcePolicy, normalizeResources, type ResourceConfig, type ResourcePolicy, type ResourceQuota } from './resource-policy';

export function IdentityResourcePolicies() {
    const { t } = useTranslation('trafficControl');
    const readable = usePermission('resources:read');
    const writable = usePermission('resources:write');
    const scope = authScope();
    const { data, error, mutate } = useSWR(readable ? [scope, 'resources'] : null, () => authAPI<ResourceConfig>('GET', '/resources'));
    const [generation, setGeneration] = useState(0);
    const [reloadFailed, setReloadFailed] = useState(false);
    if (!readable) return null;
    return <Card noMargin><CardHeader><h2 className="font-medium">{t('resources.title')}</h2><Button onClick={() => { void (async () => {
        if (!await confirmAction(t('resources.discardConfirm'))) return;
        setReloadFailed(false);
        try { await mutate(); setGeneration(value => value + 1); } catch { setReloadFailed(true); }
    })(); }}>{t('resources.reload')}</Button></CardHeader><CardBody className="space-y-4">
        <p className="text-sm text-ui-muted">{t('resources.help')}</p>
        {(error || reloadFailed) && <p role="alert" className="text-ui-danger">{t('resources.requestFailed')}</p>}
        {data && <ResourceEditor key={`${scope}:${generation}`} initial={data} writable={writable} onSaved={saved => mutate(saved, false)} />}
    </CardBody></Card>;
}

const statusFields = ['windows', 'pendingWrites', 'denied', 'persistenceFailures', 'refreshFailures', 'droppedAlerts', 'pendingAlerts', 'alertPersistenceFailures'] as const;

/** Quota engine counters, shown with the other diagnostics. */
export function ResourceStatus() {
    const { t } = useTranslation('trafficControl');
    const scope = authScope();
    const { data: status, error } = useSWR([scope, 'resource-status'], () => authAPI<Go.resource.Status>('GET', '/resources/status'), { refreshInterval: 5000 });
    return <Card noMargin><CardHeader><h2 className="font-medium">{t('resources.statusTitle')}</h2></CardHeader><CardBody>
        {error && <p role="alert" className="text-sm text-ui-danger">{t('resources.requestFailed')}</p>}
        {status && <dl className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">{statusFields.map(field => <div key={field}>
            <dt className="text-xs text-ui-muted">{t(`resources.statusField.${field}`)}</dt>
            <dd className={`mt-0.5 font-semibold tabular-nums ${status[field] && field !== 'windows' && field !== 'pendingWrites' && field !== 'pendingAlerts' ? 'text-ui-warning' : ''}`}>{Number(status[field] ?? 0).toLocaleString()}</dd>
        </div>)}</dl>}
    </CardBody></Card>;
}

/**
 * One collapsible policy. Policies sharing a `name` behave as an accordion so
 * only one long editor is open at a time. Invalid fields open their policy so
 * the browser can point at them.
 */
function PolicyItem({ title, summary, defaultOpen = false, children }: { title: string; summary: string; defaultOpen?: boolean; children: ReactNode }) {
    return <details name="resource-policy" open={defaultOpen || undefined} onInvalidCapture={event => { (event.currentTarget as HTMLDetailsElement).open = true; }}
        className="group min-w-0 rounded-ui-md border border-ui-border open:bg-ui-surface-muted/30">
        <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
            <ChevronRight size={16} aria-hidden="true" className="shrink-0 text-ui-muted transition-transform group-open:rotate-90" />
            <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-ui-heading">{title}</span>
                <span className="mt-0.5 block truncate text-xs text-ui-secondary">{summary}</span>
            </span>
        </summary>
        <div className="min-w-0 space-y-4 border-t border-ui-border/60 px-4 py-4">{children}</div>
    </details>;
}

function PolicySection({ title, count, help, children, action }: { title: string; count?: number; help?: string; children: ReactNode; action: ReactNode }) {
    return <section className="min-w-0 space-y-2">
        <header className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-medium">{title}{count !== undefined && <span className="ml-2 text-sm font-normal text-ui-muted">{count}</span>}</h3>
            {action}
        </header>
        {help && <p className="text-xs text-ui-muted">{help}</p>}
        {children}
    </section>;
}

type Collection = 'groups' | 'users' | 'credentials';

function ResourceEditor({ initial, writable, onSaved }: { initial: ResourceConfig; writable: boolean; onSaved: (saved: ResourceConfig) => Promise<unknown> }) {
    const { t } = useTranslation('trafficControl');
    const form = useRef<HTMLFormElement>(null);
    const [config, setConfig] = useState(() => normalizeResources(initial));
    const [keys, setKeys] = useState(() => ({ groups: (initial.groups ?? []).map(createID), users: (initial.users ?? []).map(createID), credentials: (initial.credentials ?? []).map(createID) }));
    const [busy, setBusy] = useState(false);
    const [failure, setFailure] = useState('');
    const [validation, setValidation] = useState<string[]>([]);
    const [valid, setValid] = useState(false);
    const [saved, setSaved] = useState(false);
    const disabled = !writable || busy;
    const profileSummary = useProfileSummary();
    const quotaSummary = (quotas: ResourceQuota[] | undefined) => quotas?.length
        ? quotas.map(quota => t(`resources.${quota.period}`)).join(' / ')
        : t('resources.noQuotaShort');
    const policySummary = (policy: ResourcePolicy) => `${profileSummary(policy.profile)} · ${quotaSummary(policy.quotas)}`;
    const patch = (next: ResourceConfig) => { setConfig(next); setValid(false); setSaved(false); setFailure(''); setValidation([]); };
    const remove = (collection: Collection, index: number) => {
        patch({ ...config, [collection]: config[collection].filter((_, i) => i !== index) });
        setKeys(current => ({ ...current, [collection]: current[collection].filter((_, i) => i !== index) }));
    };
    const add = (collection: Collection) => {
        const value = collection === 'groups' ? { groupId: '', sharedProfile: blankProfile(), individualProfile: blankProfile(), userLimits: blankLimits(), quotas: [] } : collection === 'users' ? { userId: '', policy: blankResourcePolicy() } : { credentialId: '', policy: blankResourcePolicy() };
        patch({ ...config, [collection]: [...config[collection], value] });
        setKeys(current => ({ ...current, [collection]: [...current[collection], createID()] }));
    };
    const submit = async (activate: boolean) => {
        if (disabled || !form.current?.reportValidity()) return;
        const scope = authScope();
        setBusy(true); setFailure(''); setSaved(false);
        try {
            const result = await authAPI<{ valid: boolean; errors: string[] }>('POST', '/resources/validate', config);
            setValidation(result.errors ?? []); setValid(result.valid);
            if (!activate || !result.valid || scope !== authScope()) return;
            if (!await confirmAction(t('resources.activateConfirm')) || scope !== authScope()) return;
            const next = normalizeResources(await authAPI<ResourceConfig>('PUT', '/resources', config));
            if (scope !== authScope()) return;
            setConfig(next); await onSaved(next); setSaved(true);
        } catch (cause) {
            setFailure(t(cause && typeof cause === 'object' && 'code' in cause && cause.code === 409 ? 'resources.conflict' : 'resources.requestFailed'));
        } finally { setBusy(false); }
    };
    return <form ref={form} aria-label={t('resources.title')} className="min-w-0 space-y-5" onSubmit={event => { event.preventDefault(); void submit(true); }}>
        <p className="text-xs text-ui-muted">{t('resources.revision', { revision: config.revision })}</p>
        <fieldset disabled={disabled} className="min-w-0 space-y-5">
            <div className="w-fit"><Switch label={t('resources.enabled')} checked={config.enabled} onCheckedChange={enabled => patch({ ...config, enabled })} /></div>
            <PolicySection title={t('resources.defaultUser')} help={t('resources.overrideHelp')} action={null}>
                <PolicyItem defaultOpen title={t('resources.defaultUser')} summary={policySummary(config.defaultUser)}>
                    <ResourcePolicyEditor policy={config.defaultUser} disabled={disabled} onChange={defaultUser => patch({ ...config, defaultUser })} />
                </PolicyItem>
            </PolicySection>
            <PolicySection title={t('resources.groups')} count={config.groups.length} help={t('resources.groupHelp')}
                action={<Button type="button" size="sm" variant="outline-secondary" disabled={disabled || config.groups.length >= 1024} onClick={() => add('groups')}><Plus size={14} />{t('resources.addGroup')}</Button>}>
                {config.groups.map((group, index) => <PolicyItem key={keys.groups[index]} defaultOpen={!group.groupId} title={group.groupId || t('resources.unassigned')}
                    summary={`${t('resources.shared')}: ${profileSummary(group.sharedProfile)} · ${quotaSummary(group.quotas)}`}>
                    <ResourceID kind="group" value={group.groupId} disabled={disabled} onChange={groupId => patch({ ...config, groups: config.groups.map((value, i) => i === index ? { ...value, groupId } : value) })} />
                    <h4 className="text-sm font-medium">{t('resources.shared')}</h4><ProfileEditor profile={group.sharedProfile} disabled={disabled} onChange={sharedProfile => patch({ ...config, groups: config.groups.map((value, i) => i === index ? { ...value, sharedProfile } : value) })} />
                    <h4 className="text-sm font-medium">{t('resources.individual')}</h4><ProfileEditor profile={group.individualProfile} disabled={disabled} onChange={individualProfile => patch({ ...config, groups: config.groups.map((value, i) => i === index ? { ...value, individualProfile } : value) })} />
                    <ResourceLimitsEditor value={group.userLimits} disabled={disabled} onChange={userLimits => patch({ ...config, groups: config.groups.map((value, i) => i === index ? { ...value, userLimits } : value) })} />
                    <QuotaEditor values={group.quotas} disabled={disabled} onChange={quotas => patch({ ...config, groups: config.groups.map((value, i) => i === index ? { ...value, quotas } : value) })} />
                    <Button type="button" size="sm" variant="outline-danger" disabled={disabled} onClick={() => remove('groups', index)}>{t('remove')}</Button>
                </PolicyItem>)}
            </PolicySection>
            <PolicySection title={t('resources.users')} count={config.users.length}
                action={<Button type="button" size="sm" variant="outline-secondary" disabled={disabled || config.users.length + config.credentials.length >= 8192} onClick={() => add('users')}><Plus size={14} />{t('resources.addUser')}</Button>}>
                {config.users.map((user, index) => <PolicyItem key={keys.users[index]} defaultOpen={!user.userId} title={user.userId || t('resources.unassigned')} summary={policySummary(user.policy)}>
                    <ResourceID kind="user" value={user.userId} disabled={disabled} onChange={userId => patch({ ...config, users: config.users.map((value, i) => i === index ? { ...value, userId } : value) })} />
                    <ResourcePolicyEditor policy={user.policy} disabled={disabled} onChange={policy => patch({ ...config, users: config.users.map((value, i) => i === index ? { ...value, policy } : value) })} />
                    <Button type="button" size="sm" variant="outline-danger" disabled={disabled} onClick={() => remove('users', index)}>{t('remove')}</Button>
                </PolicyItem>)}
            </PolicySection>
            <PolicySection title={t('resources.credentials')} count={config.credentials.length}
                action={<Button type="button" size="sm" variant="outline-secondary" disabled={disabled || config.users.length + config.credentials.length >= 8192} onClick={() => add('credentials')}><Plus size={14} />{t('resources.addCredential')}</Button>}>
                {config.credentials.map((credential, index) => <PolicyItem key={keys.credentials[index]} defaultOpen={!credential.credentialId} title={credential.credentialId || t('resources.unassigned')} summary={policySummary(credential.policy)}>
                    <ResourceID kind="credential" value={credential.credentialId} disabled={disabled} onChange={credentialId => patch({ ...config, credentials: config.credentials.map((value, i) => i === index ? { ...value, credentialId } : value) })} />
                    <ResourcePolicyEditor policy={credential.policy} disabled={disabled} onChange={policy => patch({ ...config, credentials: config.credentials.map((value, i) => i === index ? { ...value, policy } : value) })} />
                    <Button type="button" size="sm" variant="outline-danger" disabled={disabled} onClick={() => remove('credentials', index)}>{t('remove')}</Button>
                </PolicyItem>)}
            </PolicySection>
            <div className="flex flex-wrap gap-2"><Button type="button" disabled={disabled} onClick={() => void submit(false)}>{t('resources.validate')}</Button><Button type="submit" disabled={disabled} loading={busy}>{t('resources.activate')}</Button><StageChangeButton disabled={disabled} request={{ store: "identity", kind: "resource-policy", payload: config }} onCommitted={async () => { const next = normalizeResources(await authAPI<ResourceConfig>("GET", "/resources")); setConfig(next); await onSaved(next); }} /></div>
        </fieldset>
        {failure && <p role="alert" className="text-ui-danger">{failure}</p>}
        {validation.length > 0 && <ul role="alert" className="space-y-1 break-words text-sm text-ui-danger">{validation.map((message, index) => <li key={index}>{message}</li>)}</ul>}
        {valid && <p role="status">{t(saved ? 'resources.saved' : 'resources.valid')}</p>}
    </form>;
}
