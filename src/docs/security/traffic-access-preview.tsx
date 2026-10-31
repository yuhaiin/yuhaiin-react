import type { Go } from '@/api/generated-contracts';
import { authAPI } from '@/auth/api';
import { Button } from '@/component/v2/button';
import { Input } from '@/component/v2/input';
import { Select } from '@/component/v2/select';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function AccessPreview() {
    const { t } = useTranslation('auth');
    const [request, setRequest] = useState({ credentialId: '', inboundId: '', protocol: 'tcp', destination: '', resolvedIp: '' });
    const [result, setResult] = useState<Go.access.Decision>();
    const [failure, setFailure] = useState(false);
    const [busy, setBusy] = useState(false);
    return <form aria-label={t('access.preview')} className="space-y-3 border-t border-ui-border pt-4" onSubmit={event => { event.preventDefault(); setBusy(true); setFailure(false); setResult(undefined); void authAPI<Go.access.Decision>('POST', '/traffic-access/preview', request).then(setResult).catch(() => setFailure(true)).finally(() => setBusy(false)); }}>
        <h3 className="font-medium">{t('access.preview')}</h3><p className="text-sm text-ui-muted">{t('access.previewHelp')}</p>
        <fieldset disabled={busy} className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2">
            {(['credentialId', 'inboundId', 'destination', 'resolvedIp'] as const).map(field => <label key={field} className="block min-w-0 space-y-2"><span>{t(`access.${field}`)}</span><Input required value={request[field]} onChange={event => { setRequest({ ...request, [field]: event.target.value }); setResult(undefined); }} /></label>)}
            <Select ariaLabel={t('access.protocol')} value={request.protocol} items={['tcp', 'udp'].map(value => ({ value, label: value }))} onValueChange={protocol => { setRequest({ ...request, protocol }); setResult(undefined); }} />
            <Button type="submit">{t('access.preview')}</Button>
        </fieldset>
        {failure && <p role="alert" className="text-ui-danger">{t('requestFailed')}</p>}
        {result && <div role="status" className="space-y-1 break-all text-sm"><p>{t(result.managed ? result.allowed ? 'access.allow' : 'access.deny' : 'access.unmanaged')}</p><p>{t('access.revision', { revision: result.revision })} · {t(`access.reason.${result.reason}`, { defaultValue: result.reason })}</p>{result.ruleId && <p>{t('access.matchedRule')}: {result.ruleId}</p>}</div>}
    </form>;
}
