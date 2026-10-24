import { changeAPI, type ConfigurationChange } from '@/api/configuration-changes';
import { useSession } from '@/auth/context';
import { authScope } from '@/auth/session';
import { ChangeReview } from '@/component/configuration-change';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardHeader } from '@/component/v2/card';
import { Select } from '@/component/v2/select';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

export function ConfigurationChanges() {
    const session = useSession();
    if (!session?.principal.permissions.includes('configuration:read')) return null;
    return <ChangeWorkspace key={authScope()} />;
}
function ChangeWorkspace() {
    const { t } = useTranslation('auth'); const scope = authScope();
    const { data, error, mutate } = useSWR([scope, 'configuration-changes'], () => changeAPI.list(), { revalidateOnFocus: false });
    const { data: targets } = useSWR([scope, 'configuration-targets'], () => changeAPI.targets(), { revalidateOnFocus: false });
    const [kind, setKind] = useState('all'); const [state, setState] = useState('all');
    const [selected, setSelected] = useState<ConfigurationChange>(); const [failure, setFailure] = useState(false); const [busy, setBusy] = useState(false);
    const request = useRef<AbortController | undefined>(undefined);
    useEffect(() => () => request.current?.abort(), [scope]);
    const inspect = async (change: ConfigurationChange) => {
        request.current?.abort(); const controller = new AbortController(); request.current = controller; setBusy(true); setFailure(false); setSelected(undefined);
        try { const next = await changeAPI.get(change, controller.signal); if (!controller.signal.aborted && scope === authScope()) setSelected(next); }
        catch { if (!controller.signal.aborted && scope === authScope()) setFailure(true); }
        finally { if (!controller.signal.aborted && scope === authScope()) setBusy(false); }
    };
    const target = targets?.find(item => item.store === selected?.store && item.kind === selected?.kind);
    const items = data?.filter(item => (kind === 'all' || item.kind === kind) && (state === 'all' || item.state === state));
    return <Card><CardHeader><h2 className="font-medium">{t('changes.title')}</h2><Button onClick={() => void mutate()}>{t('refresh')}</Button></CardHeader><CardBody className="min-w-0 space-y-4">
        <p className="text-sm text-ui-muted">{t('changes.help')}</p>
        <div className="grid gap-3 sm:grid-cols-2"><Select ariaLabel={t('changes.kind')} value={kind} onValueChange={setKind} items={[{ value: 'all', label: t('changes.all') }, ...(targets ?? []).map(item => ({ value: item.kind, label: t(`changes.kinds.${item.kind}`) }))]} />
            <Select ariaLabel={t('changes.state')} value={state} onValueChange={setState} items={['all', 'staged', 'committed'].map(value => ({ value, label: t(value === 'all' ? 'changes.all' : `changes.states.${value}`) }))} /></div>
        {(error || failure) && <p role="alert" className="text-sm text-ui-danger">{t('requestFailed')}</p>}
        <div className="max-h-80 space-y-2 overflow-auto">{items?.map(item => <div key={`${item.store}:${item.id}`} className="flex min-w-0 flex-wrap items-center justify-between gap-2 rounded-ui-sm border border-ui-border p-3">
            <div className="min-w-0 text-sm"><p className="break-all">{t(`changes.kinds.${item.kind}`)} · {item.resourceId}</p><p className="break-all text-xs text-ui-muted">{t(`changes.states.${item.state}`)} · {item.committedBy || item.createdBy} · {new Date(item.committedAt || item.createdAt).toLocaleString()}</p></div>
            <Button disabled={busy} onClick={() => void inspect(item)}>{t('changes.inspect')}</Button>
        </div>)}</div>
        {items?.length === 0 && <p className="text-sm text-ui-muted">{t('changes.empty')}</p>}
        {selected && <section className="min-w-0 border-t border-ui-border pt-4"><ChangeReview key={selected.id} initial={selected} writable={target?.writable ?? false} rollback={target?.rollback ?? false} onChanged={async next => { setSelected(next); await mutate(); }} /></section>}
    </CardBody></Card>;
}
