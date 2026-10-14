import { listDNSQueryTypes, testResolver } from '@/api/resolvers';
import type { Go } from '@/api/generated-contracts';
import type { Resolver } from '@/contract/resolver';
import { useAsyncAction } from '@/hooks/use-editor-draft';
import { Button } from './v2/button';
import { Input } from './v2/input';
import { Select } from './v2/select';
import { Spinner } from './v2/spinner';
import { FlaskConical, Play, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

const commonTypes = ['A', 'AAAA', 'HTTPS', 'TXT', 'MX'];
export function ResolverTestPanel({ resolver, disabled, onPendingChange }: { resolver: Resolver; disabled: boolean; onPendingChange: (pending: boolean) => void }) {
    const { t } = useTranslation('routing');
    const { data, error: typesError, mutate } = useSWR('/api/v2/resolvers/query-types', listDNSQueryTypes, { revalidateOnFocus: false });
    const [domain, setDomain] = useState('example.com');
    const [queryType, setType] = useState('A');
    const [result, setResult] = useState<Go.resolver.TestResponse>();
    const [error, setError] = useState('');
    const abort = useRef<AbortController | null>(null);
    const signature = JSON.stringify(resolver);
    const [previousSignature, setPreviousSignature] = useState(signature);
    if (previousSignature !== signature) { setPreviousSignature(signature); setResult(undefined); setError(''); }
    const { pending, run } = useAsyncAction(error => setError(String((error as { msg?: string })?.msg ?? error)));
    useEffect(() => { onPendingChange(pending); return () => onPendingChange(false); }, [pending, onPendingChange]);
    useEffect(() => () => abort.current?.abort(), [signature]);
    const types = [...new Set([...(data?.types ?? []), queryType])].sort((a, b) => {
        const rank = (type: string) => { const index = commonTypes.indexOf(type); return index < 0 ? commonTypes.length : index; };
        return rank(a) - rank(b) || a.localeCompare(b);
    });
    const test = () => {
        if (pending || disabled || !domain.trim()) return;
        setResult(undefined); setError('');
        void run(async () => {
            const controller = new AbortController(); abort.current = controller;
            try { const response = await testResolver({ resolver, domain: domain.trim(), queryType }, controller.signal); if (!controller.signal.aborted) setResult(response); }
            catch (error) { if (!controller.signal.aborted) throw error; }
            finally { if (abort.current === controller) abort.current = null; }
        });
    };
    return <section aria-label={t('resolverTest')} className="mt-5 space-y-4 rounded-ui-lg border border-ui-border bg-ui-surface p-4">
        <div><h3 className="flex items-center gap-2 text-sm font-semibold text-ui-heading"><FlaskConical size={17} />{t('resolverTest')}</h3><p className="mt-1 text-xs text-ui-muted">{t('resolverTestHelp')}</p></div>
        <fieldset disabled={pending || disabled} className="min-w-0 grid gap-3 sm:grid-cols-[minmax(0,1fr)_130px_auto] sm:items-end">
            <label className="min-w-0"><span className="mb-1.5 block text-xs text-ui-muted">{t('testDomain')}</span><Input aria-label={t('testDomain')} value={domain} onChange={event => { setDomain(event.target.value); setResult(undefined); }} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); test(); } }} /></label>
            <label className="min-w-0"><span className="mb-1.5 block text-xs text-ui-muted">{t('dnsQueryType')}</span><Select disabled={pending || disabled} ariaLabel={t('dnsQueryType')} value={queryType} items={types.map(type => ({ value: type, label: type }))} onValueChange={value => { setType(value); setResult(undefined); }} /></label>
            <Button type="button" variant="outline-primary" className="shrink-0 gap-2" disabled={!domain.trim()} onClick={test}>{pending ? <Spinner size="sm" /> : <Play size={15} />}{t('runResolverTest')}</Button>
        </fieldset>
        {pending && <div className="flex items-center justify-between gap-2 text-sm text-ui-muted" role="status">{t('testingResolver')}<Button variant="outline-secondary" size="sm" className="gap-1.5" onClick={() => abort.current?.abort()}><X size={14} />{t('cancelTest')}</Button></div>}
        {typesError && <p role="alert" className="text-xs text-ui-danger">{t('dnsTypesFailed')} <Button size="sm" onClick={() => void mutate()}>{t('retry')}</Button></p>}
        {error && <p role="alert" className="break-words text-sm text-ui-danger">{error}</p>}
        {result && <div className="min-w-0 space-y-3" aria-live="polite">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ui-muted"><span className="break-all font-medium text-ui-heading">{result.domain} · {result.queryType}</span><span>{result.elapsedMs.toFixed(1)} ms</span>{result.rcode && <span className="font-mono">{result.rcode}</span>}{result.truncated && <span>{t('dnsResponseTruncated')}</span>}</div>
            {result.error ? <p role="alert" className="break-words text-sm text-ui-danger">{result.error}</p> : result.records.length ? <div className="max-h-72 overflow-auto rounded-ui-md bg-ui-surface-muted p-3"><pre className="m-0 whitespace-pre-wrap break-all font-mono text-xs leading-6">{result.records.map(record => `${record.section}: ${record.value}`).join('\n')}</pre></div> : <p className="text-sm text-ui-muted">{t('dnsNoRecords')}</p>}
        </div>}
    </section>;
}
