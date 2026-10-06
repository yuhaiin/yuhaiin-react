import { runDiagnostics } from '@/api/tools';
import { Badge } from '@/component/v2/badge';
import { Button } from '@/component/v2/button';
import { Card, CardBody } from '@/component/v2/card';
import { useClipboard } from '@/component/v2/clipboard';
import { Input } from '@/component/v2/input';
import { Spinner } from '@/component/v2/spinner';
import type { DiagnosticReport } from '@/contract/tools';
import { Activity, Copy, Download, Square } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function DiagnosticsPage() {
    const { t } = useTranslation('diagnostics');
    const [host, setHost] = useState('www.cloudflare.com');
    const [report, setReport] = useState<DiagnosticReport>();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const controller = useRef<AbortController | null>(null);
    const { copy, copied, reset, manualCopyModal } = useClipboard({ usePromptAsFallback: true });

    useEffect(() => () => {
        controller.current?.abort();
        controller.current = null;
    }, []);

    const run = async () => {
        if (controller.current) return;
        const current = new AbortController();
        controller.current = current;
        setBusy(true);
        setError('');
        setReport(undefined);
        reset();
        // Also bound waiting when a remote API/reverse proxy becomes unreachable.
        const timer = window.setTimeout(() => current.abort(), 20000);
        try {
            const result = await runDiagnostics(host.trim(), current.signal);
            if (controller.current === current) setReport(result);
        } catch (cause) {
            if (controller.current === current) {
                const code = (cause as { code?: number })?.code;
                setError(current.signal.aborted ? t('interrupted') : code === 429 ? t('alreadyRunning') : code === 400 ? t('invalidHost') : (code === 503 || code === 404) ? t('unavailable') : t('requestFailed'));
            }
        } finally {
            window.clearTimeout(timer);
            if (controller.current === current) {
                controller.current = null;
                setBusy(false);
            }
        }
    };

    const download = () => {
        if (!report) return;
        const url = URL.createObjectURL(new Blob([report.report], { type: 'text/plain;charset=utf-8' }));
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `yuhaiin-diagnostics-${report.startedAt.replace(/[:.]/g, '-')}.txt`;
        anchor.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="mx-auto max-w-5xl space-y-5">
            <div>
                <h1 className="flex items-center gap-2 text-2xl font-bold text-ui-heading"><Activity size={24} />{t('title')}</h1>
                <p className="mt-2 text-sm text-ui-muted">{t('description')}</p>
            </div>
            <Card noMargin>
                <CardBody>
                    <form onSubmit={event => { event.preventDefault(); void run(); }} className="space-y-3">
                        <label className="block text-sm font-medium" htmlFor="diagnostic-host">{t('target')}</label>
                        <div className="flex flex-wrap gap-2">
                            <Input id="diagnostic-host" className="min-w-0 flex-1 basis-full sm:basis-0" value={host} onChange={event => setHost(event.target.value)} disabled={busy} placeholder="www.cloudflare.com" autoCapitalize="none" spellCheck={false} />
                            <Button type="submit" variant="primary" disabled={busy}>{busy ? <Spinner size="sm" /> : <Activity size={16} />}{busy ? t('running') : t('run')}</Button>
                            {busy && <Button type="button" onClick={() => controller.current?.abort()}><Square size={14} />{t('cancel')}</Button>}
                        </div>
                        <p className="text-xs text-ui-muted">{t('targetHint')}</p>
                        <div role="status" aria-live="polite" className="text-sm text-ui-muted">{busy && t('progress')}</div>
                    </form>
                    {error && <p role="alert" className="mt-3 text-sm text-ui-danger">{error}</p>}
                </CardBody>
            </Card>
            {report && <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0 break-words text-sm text-ui-muted">{report.host} · {report.platform} · {new Date(report.startedAt).toLocaleString()} · {report.durationMs} ms</div>
                    <div className="flex flex-wrap gap-2">
                        <Button onClick={() => void copy(report.report)}><Copy size={16} />{copied ? t('copied') : t('copy')}</Button>
                        <Button onClick={download}><Download size={16} />{t('download')}</Button>
                    </div>
                </div>
                <Card noMargin><CardBody>
                    <h2 className="mb-3 text-base font-semibold text-ui-heading">{t('findings')}</h2>
                    <ul className="list-disc space-y-2 pl-5 text-sm">
                        {report.findings.map(code => <li key={code}>{t(`findingsText.${code}`, { defaultValue: code })}</li>)}
                    </ul>
                </CardBody></Card>
                <div className="grid gap-3 sm:grid-cols-2">
                    {report.checks.map(check => <Card key={check.id} noMargin><CardBody>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <h2 className="text-base font-semibold text-ui-heading">{t(`checks.${check.id}`, { defaultValue: check.id })}</h2>
                            <Badge variant={check.status === 'pass' ? 'success' : check.status === 'fail' ? 'danger' : check.status === 'warning' ? 'warning' : 'muted'}>{t(`status.${check.status}`, { defaultValue: check.status })}</Badge>
                        </div>
                        <p className="mt-2 text-sm">{t(`messages.${check.message}`, { defaultValue: check.message })}</p>
                        <ul className="mt-2 space-y-1 break-all font-mono text-xs text-ui-muted">{check.evidence.map((line, index) => <li key={index}>{line}</li>)}</ul>
                        <p className="mt-2 text-xs text-ui-muted">{check.durationMs} ms</p>
                    </CardBody></Card>)}
                </div>
                <p className="text-xs text-ui-muted">{t('privacy')}</p>
            </>}
            {manualCopyModal}
        </div>
    );
}
