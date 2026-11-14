import { getSystemNetworkRoutes, systemNetworkKeys } from '@/api/system-network';
import { Badge } from '@/component/v2/badge';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardHeader, FilterSearch } from '@/component/v2/card';
import Switch from '@/component/v2/switch';
import { cn, ui } from '@/component/v2/styles';
import type { SystemRouteEntry, SystemRoutes } from '@/contract/system-network';
import type { TFunction } from 'i18next';
import { RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

const PAGE = 300;

/** Linux table numbers with a name of their own. */
function tableName(t: TFunction<'systemNetwork'>, table: number): string {
    if (table === 254) return t('routes.tables.main');
    if (table === 253) return t('routes.tables.default');
    if (table === 63) return t('routes.tables.yuhaiin');
    if (table >= 6299 && table < 6400) return t('routes.tables.forwarding', { table });
    return t('routes.tables.other', { table });
}

function matches(route: SystemRouteEntry, query: string): boolean {
    if (!query) return true;
    return [route.destination, route.gateway, route.interface, route.ruleName, route.ruleId, route.type]
        .some(v => v?.toLowerCase().includes(query));
}

/**
 * A read-only view of the operating system routing table. Routes Yuhaiin
 * installed are marked with the rule they come from, so they can be told
 * apart from routes of the system and other programs.
 */
export function RoutesTab() {
    const { t } = useTranslation('systemNetwork');
    const routes = useSWR(systemNetworkKeys.routes, getSystemNetworkRoutes, { refreshInterval: 15000, revalidateOnFocus: false });
    const [query, setQuery] = useState('');
    const [onlyYuhaiin, setOnlyYuhaiin] = useState(false);
    const [limit, setLimit] = useState(PAGE);
    const data = routes.data;
    const visible = useMemo(() => (data?.routes ?? []).filter(r => (!onlyYuhaiin || r.yuhaiin) && matches(r, query)), [data, onlyYuhaiin, query]);
    const tables = new Set(visible.map(r => r.table ?? 0));
    const error = routes.error ? String((routes.error as { msg?: string })?.msg ?? routes.error) : data?.error;

    return <div className="grid min-w-0 gap-5">
        <Card noMargin>
            <CardHeader>
                <div className="min-w-0">
                    <h2 className={ui.sectionTitle}>{t('routes.title')}</h2>
                    <p className="mt-1 text-xs leading-relaxed text-ui-muted">{t('routes.help')}</p>
                </div>
                <Button size="sm" variant="outline-secondary" loading={routes.isValidating} onClick={() => void routes.mutate()}><RefreshCw size={15} />{t('routes.refresh')}</Button>
            </CardHeader>
            <CardBody>
                <div className="grid gap-3">
                    {data && <PlatformNote data={data} />}
                    {error && <p role="alert" className="text-sm text-ui-danger">{error}</p>}
                    {data && <p className="text-sm text-ui-fg" aria-live="polite">{t('routes.summary', { total: data.total, yuhaiin: data.yuhaiinRoutes })}
                        {data.truncated && <span className="ml-2 text-xs text-ui-warning">{t('routes.truncated', { count: data.routes.length })}</span>}</p>}
                    <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
                        <FilterSearch className="min-w-0 flex-1 basis-56" size="sm" onSearch={value => { setQuery(value.trim()); setLimit(PAGE); }} />
                        <Switch label={t('routes.onlyYuhaiin')} checked={onlyYuhaiin} onCheckedChange={v => { setOnlyYuhaiin(v); setLimit(PAGE); }} />
                    </div>
                    {!data && !error && <p className="text-sm text-ui-muted">{t('routes.loading')}</p>}
                    {data && visible.length === 0 && <p className="text-sm text-ui-muted">{t('routes.empty')}</p>}
                    <ul className="grid min-w-0 gap-2" aria-label={t('routes.title')}>
                        {visible.slice(0, limit).map((r, i, list) => {
                            const table = r.table ?? 0;
                            const heading = tables.size > 1 && (i === 0 || (list[i - 1].table ?? 0) !== table);
                            return <RouteRow key={`${table}:${r.destination}:${r.interfaceIndex ?? r.interface}:${r.gateway}:${r.metric}:${i}`} route={r}
                                heading={heading ? tableName(t, table) : undefined} />;
                        })}
                    </ul>
                    {visible.length > limit && <Button size="sm" variant="outline-secondary" className="justify-self-start" onClick={() => setLimit(l => l + PAGE)}>
                        {t('routes.more', { count: visible.length - limit })}</Button>}
                </div>
            </CardBody>
        </Card>
        {data && data.rules.length > 0 && <PolicyRules data={data} />}
    </div>;
}

function PlatformNote({ data }: { data: SystemRoutes }) {
    const { t } = useTranslation('systemNetwork');
    if (data.platform !== 'android') return null;
    return <p className="rounded-ui-md border border-ui-border bg-ui-chip p-3 text-xs leading-relaxed text-ui-fg">
        {t(data.readable ? 'routes.androidNote' : 'routes.androidVpnOnly')}
    </p>;
}

function RouteRow({ route: r, heading }: { route: SystemRouteEntry; heading?: string }) {
    const { t } = useTranslation('systemNetwork');
    const source = r.source || 'rule';
    return <>
        {heading && <li role="presentation" className="pt-2 text-xs font-semibold uppercase tracking-wide text-ui-muted first:pt-0">{heading}</li>}
        <li className={cn('grid min-w-0 gap-1 rounded-ui-md border border-ui-border px-3 py-2',
            r.yuhaiin && 'border-l-4 border-l-ui-primary bg-ui-selected/40')}>
            <div className="flex min-w-0 flex-wrap items-center gap-2">
                <span className="min-w-0 break-all font-mono text-sm font-medium text-ui-heading">{r.destination}</span>
                {r.yuhaiin && <Badge variant={source === 'stale' ? 'warning' : 'primary'} title={t(`routes.sourceHelp.${source}`)}>
                    {t('routes.yuhaiin')}</Badge>}
                {r.type && r.type !== 'unicast' && <span className={ui.chip}>{r.type}</span>}
            </div>
            <p className="min-w-0 break-words text-xs text-ui-fg">
                {r.gateway ? t('routes.via', { gateway: r.gateway }) + ' ' : ''}
                {r.interface || r.interfaceIndex ? t('routes.dev', { name: r.interface || `#${r.interfaceIndex}` }) : ''}
                {r.metric ? <span className="text-ui-muted"> · {t('routes.metric', { metric: r.metric })}</span> : null}
            </p>
            {r.yuhaiin && <p className="text-xs text-ui-primary">
                {t(`routes.source.${source}`)}{r.ruleName || r.ruleId ? `: ${r.ruleName || r.ruleId}` : ''}
            </p>}
        </li>
    </>;
}

function PolicyRules({ data }: { data: SystemRoutes }) {
    const { t } = useTranslation('systemNetwork');
    return <Card noMargin>
        <CardHeader>
            <div className="min-w-0">
                <h2 className={ui.sectionTitle}>{t('routes.rulesTitle')}</h2>
                <p className="mt-1 text-xs leading-relaxed text-ui-muted">{t('routes.rulesHelp')}</p>
            </div>
        </CardHeader>
        <CardBody>
            <ul className="grid gap-1 text-sm" aria-label={t('routes.rulesTitle')}>
                {data.rules.map((r, i) => <li key={`${r.family}:${r.priority}:${r.selector}:${r.table}:${i}`}
                    className={cn('flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 rounded-ui-sm px-2 py-1', r.yuhaiin && 'border-l-4 border-l-ui-primary bg-ui-selected/40')}>
                    <span className="w-14 shrink-0 font-mono text-ui-muted">{r.priority}</span>
                    <span className={ui.chip}>{r.family === 10 ? 'IPv6' : 'IPv4'}</span>
                    <span className="min-w-0 break-all font-mono">{r.selector}</span>
                    <span className="text-ui-muted">{t('routes.lookup', { table: tableName(t, r.table) })}</span>
                    {r.yuhaiin && <Badge variant="primary">{t('routes.yuhaiin')}</Badge>}
                </li>)}
            </ul>
        </CardBody>
    </Card>;
}
