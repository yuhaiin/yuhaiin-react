import { authAPI } from '@/auth/api';
import { authScope } from '@/auth/session';
import { Button } from '@/component/v2/button';
import { Input } from '@/component/v2/input';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { type UsageOptions } from './usage-api';

export function UsageRetention() {
    const { t } = useTranslation('auth');
    const { data, error, mutate } = useSWR([authScope(), 'usage-retention'], () => authAPI<UsageOptions>('GET', '/usage/settings'));
    return <details className="space-y-3"><summary className="cursor-pointer text-sm font-medium">{t('usage.retention')}</summary>
        <p className="text-sm text-ui-muted">{t('usage.retentionHint')}</p>
        {error && <p role="alert" className="text-sm text-ui-danger">{t('usage.loadFailed')}</p>}
        {data && <RetentionForm key={JSON.stringify(data)} initial={data} onSaved={() => void mutate()} />}
    </details>;
}

function RetentionForm({ initial, onSaved }: { initial: UsageOptions; onSaved: () => void }) {
    const { t } = useTranslation('auth');
    const [value, setValue] = useState(initial);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(false);
    const [saved, setSaved] = useState(false);
    const fields: Array<{ key: keyof UsageOptions; min: number; max: number }> = [{ key: 'auditDays', min: 1, max: 365 }, { key: 'maxAuditRows', min: 100, max: 1000000 }, { key: 'hourlyDays', min: 1, max: 90 }, { key: 'dailyDays', min: value.hourlyDays, max: 730 }];
    return <form className="space-y-3" onSubmit={event => { event.preventDefault(); setBusy(true); setError(false); setSaved(false); void authAPI('PUT', '/usage/settings', value).then(() => { setSaved(true); onSaved(); }).catch(() => setError(true)).finally(() => setBusy(false)); }}>
        <div className="grid gap-3 sm:grid-cols-2">{fields.map(field => <label key={field.key} className="space-y-2"><span className="text-sm">{t(`usage.${field.key}`)}</span><Input type="number" required min={field.min} max={field.max} step={1} value={value[field.key]} disabled={busy} onChange={event => { setValue({ ...value, [field.key]: Number(event.target.value) }); setSaved(false); }} /></label>)}</div>
        {error && <p role="alert" className="text-sm text-ui-danger">{t('requestFailed')}</p>}{saved && <p role="status" className="text-sm">{t('usage.saved')}</p>}
        <Button type="submit" permission="users:manage" disabled={busy}>{t('save')}</Button>
    </form>;
}
