import type { Go } from '@/api/generated-contracts';
import { authAPI } from '@/auth/api';
import { createID } from '@/common/id';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardHeader } from '@/component/v2/card';
import { confirmAction } from '@/component/v2/confirmation';
import { Input } from '@/component/v2/input';
import { Select } from '@/component/v2/select';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { RuleExprListEditor } from '../bypass/rule-form';
import type { RuleEditorOptions } from '../bypass/rule-form';
import { AccessPreview } from './traffic-access-preview';
import { InboundCondition } from '../bypass/inbound-condition';
import { authScope } from '@/auth/session';

const options: RuleEditorOptions = { lists: [], inbounds: [], resolvers: [], rawInboundIDs: true, allowedTypes: ['user', 'group', 'credential', 'inbound', 'destination', 'network', 'port', 'all', 'any', 'not', 'always'] };
export function TrafficAccess({ writable }: { writable: boolean }) {
    const { t } = useTranslation('auth');
    const { data, error, mutate } = useSWR([authScope(), 'traffic-access'], () => authAPI<Go.access.Config>('GET', '/traffic-access'));
    const { data: status } = useSWR([authScope(), 'traffic-access-status'], () => authAPI<Go.access.Status>('GET', '/traffic-access/status'), { refreshInterval: 5000 });
    const [generation, setGeneration] = useState(0);
    const [reloadFailed, setReloadFailed] = useState(false);
    return <Card><CardHeader><h2 className="font-medium">{t('access.title')}</h2><Button onClick={() => { void (async () => { if (await confirmAction(t('access.reloadConfirm'))) { setReloadFailed(false); try { await mutate(); setGeneration(value => value + 1); } catch { setReloadFailed(true); } } })(); }}>{t('refresh')}</Button></CardHeader><CardBody className="space-y-4">
        <p className="text-sm text-ui-muted">{t('access.help')}</p>
        {status && <p className="text-xs text-ui-muted">{t('access.status', { sessions: status.sessions, denied: status.denied, revoked: status.revoked, capacity: status.capacityRejected })}</p>}
        {(error || reloadFailed) && <p role="alert" className="text-ui-danger">{t('requestFailed')}</p>}
        {data && <AccessEditor key={generation} initial={data} writable={writable} onSaved={saved => mutate(saved, false)} />}
        <AccessPreview />
    </CardBody></Card>;
}

function AccessEditor({ initial, writable, onSaved }: { initial: Go.access.Config; writable: boolean; onSaved: (config: Go.access.Config) => Promise<unknown> }) {
    const { t } = useTranslation('auth');
    const [config, setConfig] = useState(initial);
    const [busy, setBusy] = useState(false);
    const [failure, setFailure] = useState('');
    const [validation, setValidation] = useState<string[]>([]);
    const [validated, setValidated] = useState(false);
    const [saved, setSaved] = useState(false);
    const patch = (next: Go.access.Config) => { setConfig(next); setValidated(false); setSaved(false); setValidation([]); };
    const reorder = (from: number, to: number) => { const rules = [...config.rules]; [rules[from], rules[to]] = [rules[to], rules[from]]; patch({ ...config, rules }); };
    const submit = async (activate: boolean) => {
        if (!writable || busy) return;
        setBusy(true); setFailure(''); setSaved(false);
        try {
            const result = await authAPI<{ valid: boolean; errors: string[] }>('POST', '/traffic-access/validate', config);
            setValidation(result.errors); setValidated(result.valid);
            if (!result.valid || !activate) return;
            if (!await confirmAction(t('access.activateConfirm'))) return;
            const next = await authAPI<Go.access.Config>('PUT', '/traffic-access', config);
            setConfig(next); await onSaved(next); setSaved(true);
        } catch (cause) { setFailure(t(cause && typeof cause === 'object' && 'code' in cause && cause.code === 409 ? 'access.conflict' : 'requestFailed')); }
        finally { setBusy(false); }
    };
    return <form aria-label={t('access.title')} onSubmit={event => { event.preventDefault(); void submit(true); }} className="space-y-4">
        <p className="text-xs text-ui-muted">{t('access.revision', { revision: config.revision })}</p>
        <fieldset disabled={!writable || busy} className="min-w-0 space-y-4">
            <label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={config.enabled} onChange={event => patch({ ...config, enabled: event.target.checked })} />{t('enabled')}</label>
            <p className="text-sm text-ui-warning">{t('access.scopeHelp')}</p>
            <label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={config.scope.allInbounds} onChange={event => patch({ ...config, scope: { allInbounds: event.target.checked, inbounds: [] } })} />{t('access.allInbounds')}</label>
            {!config.scope.allInbounds && <InboundCondition values={config.scope.inbounds} onChange={inbounds => patch({ ...config, scope: { allInbounds: false, inbounds } })} />}
            <label className="block space-y-2"><span>{t('access.default')}</span><Select value={config.defaultAction} items={['deny', 'allow'].map(value => ({ value, label: t(`access.${value}`) }))} onValueChange={defaultAction => patch({ ...config, defaultAction })} /></label>
            <p className="text-sm text-ui-muted">{t('access.orderHelp')}</p>
            {config.rules.map((rule, index) => <section key={rule.id} className="min-w-0 space-y-3 rounded-ui-md border border-ui-border p-4">
                <div className="flex flex-wrap items-center gap-2"><span>{index + 1}</span><Button type="button" disabled={index === 0} onClick={() => reorder(index, index - 1)}>{t('access.moveUp')}</Button><Button type="button" disabled={index === config.rules.length - 1} onClick={() => reorder(index, index + 1)}>{t('access.moveDown')}</Button><Button type="button" variant="outline-danger" onClick={() => patch({ ...config, rules: config.rules.filter(item => item.id !== rule.id) })}>{t('delete')}</Button></div>
                <Input aria-label={t('credentialName')} value={rule.name} maxLength={128} onChange={event => patch({ ...config, rules: config.rules.map(item => item.id === rule.id ? { ...item, name: event.target.value } : item) })} />
                <Select ariaLabel={t('access.action')} value={rule.action} items={['allow', 'deny'].map(value => ({ value, label: t(`access.${value}`) }))} onValueChange={action => patch({ ...config, rules: config.rules.map(item => item.id === rule.id ? { ...item, action } : item) })} />
                <label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={!rule.disabled} onChange={event => patch({ ...config, rules: config.rules.map(item => item.id === rule.id ? { ...item, disabled: !event.target.checked } : item) })} />{t('enabled')}</label>
                <RuleExprListEditor value={rule.conditions} options={options} onChange={conditions => patch({ ...config, rules: config.rules.map(item => item.id === rule.id ? { ...item, conditions } : item) })} />
            </section>)}
            <Button type="button" onClick={() => patch({ ...config, rules: [...config.rules, { id: createID(), name: '', action: 'allow', disabled: false, conditions: [{ type: 'all', all: [{ type: 'group', group: { ids: [] } }, { type: 'destination', destination: { domains: [], cidrs: [] } }] }] }] })}>{t('access.addRule')}</Button>
            <div className="flex flex-wrap gap-2"><Button type="button" onClick={() => void submit(false)}>{t('access.validate')}</Button><Button type="submit">{t('access.activate')}</Button></div>
        </fieldset>
        {failure && <p role="alert" className="text-ui-danger">{failure}</p>}
        {validation.length > 0 && <ul role="alert" className="space-y-1 break-words text-sm text-ui-danger">{validation.map((message, index) => <li key={index}>{message}</li>)}</ul>}
        {validated && <p role="status">{t(saved ? 'access.saved' : 'access.valid')}</p>}
    </form>;
}