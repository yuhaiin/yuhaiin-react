import { exportAndroidLogs, getAndroidLogs, startDownload } from '@/api/android';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardHeader } from '@/component/v2/card';
import { Input } from '@/component/v2/input';
import Loading from '@/component/v2/loading';
import { Select } from '@/component/v2/select';
import { useMemo, useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { AndroidOnly, errorText } from '../AndroidOnly';

export default function AndroidLogsPage() {
    const { t } = useTranslation('android');
    return <AndroidOnly title={t('logs.title')} description={t('logs.description')}><Logs /></AndroidOnly>;
}

export function filterLogLines(text: string, query: string, minLevel: string): string[] {
    const order = ['V', 'D', 'I', 'W', 'E', 'F'];
    const min = order.indexOf(minLevel);
    const q = query.trim().toLowerCase();
    return text.split('\n').filter(line => {
        if (!line) return false;
        // threadtime: "MM-DD HH:MM:SS.mmm PID TID L TAG: message"
        const level = line.split(/\s+/)[4];
        if (min > 0 && order.includes(level) && order.indexOf(level) < min) return false;
        return !q || line.toLowerCase().includes(q);
    });
}

const Logs: FC = () => {
    const { t } = useTranslation('android');
    const [lines, setLines] = useState('1000');
    const [query, setQuery] = useState('');
    const [level, setLevel] = useState('V');
    const [live, setLive] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [exportError, setExportError] = useState<string>();
    const { data, error, mutate, isValidating } = useSWR(['android/logs', lines], () => getAndroidLogs(Number(lines)), { refreshInterval: live ? 3000 : 0 });
    const shown = useMemo(() => filterLogLines(data ?? '', query, level), [data, query, level]);
    const download = async () => {
        // Logs can contain destinations, addresses and credentials.
        if (!window.confirm(t('logs.exportWarning'))) return;
        setExporting(true); setExportError(undefined);
        try { startDownload(await exportAndroidLogs()); }
        catch (e) { setExportError(errorText(e)); }
        finally { setExporting(false); }
    };
    return <Card>
        <CardHeader className="flex flex-wrap items-center gap-2">
            <Input className="min-w-0 flex-1" placeholder={t('logs.filter')} aria-label={t('logs.filter')} value={query} onChange={e => setQuery(e.target.value)} />
            <Select ariaLabel={t('logs.level')} value={level} onValueChange={setLevel} size="sm"
                items={['V', 'D', 'I', 'W', 'E'].map(value => ({ value, label: t(`logs.levels.${value}`) }))} />
            <Select ariaLabel={t('logs.lines')} value={lines} onValueChange={setLines} size="sm"
                items={['500', '1000', '5000', '20000'].map(value => ({ value, label: t('logs.lastLines', { count: Number(value) }) }))} />
            <Button size="sm" variant={live ? 'primary' : 'outline-secondary'} onClick={() => setLive(!live)}>{t(live ? 'logs.pause' : 'logs.follow')}</Button>
            <Button size="sm" variant="outline-secondary" loading={isValidating} onClick={() => mutate()}>{t('logs.refresh')}</Button>
            <Button size="sm" variant="outline-primary" loading={exporting} onClick={download}>{t('logs.export')}</Button>
        </CardHeader>
        <CardBody className="flex flex-col gap-2">
            {exportError && <p className="m-0 text-sm text-ui-danger">{exportError}</p>}
            {error && <p className="m-0 text-sm text-ui-danger">{errorText(error)}</p>}
            {!data && !error && <Loading />}
            {data !== undefined && <pre className="m-0 max-h-screen overflow-auto whitespace-pre-wrap break-all rounded-ui-md bg-ui-surface-muted p-2 font-mono text-xs text-ui-heading">
                {shown.length ? shown.join('\n') : t('logs.empty')}
            </pre>}
        </CardBody>
    </Card>;
};
