import { Badge } from '@/component/v2/badge';
import { Button } from '@/component/v2/button';
import { Switch } from '@/component/v2/switch';
import type { RuleItem } from '@/contract/route';
import clsx from 'clsx';
import { ArrowRight, ArrowUpDown, Globe, Layers, ShieldBan, Workflow } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const columns = 'md:grid md:grid-cols-[2rem_minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,.65fr)_5rem] md:items-center md:gap-5';

export function RuleTable({ items, onOpen, onPriority, onToggle, destinations, resolverNames, busy }: {
    items: RuleItem[];
    destinations: Record<string, string>;
    resolverNames: Record<string, string>;
    busy: boolean;
    onOpen: (item: RuleItem) => void;
    onPriority: (item: RuleItem) => void;
    onToggle: (item: RuleItem) => void;
}) {
    const { t } = useTranslation('routing');
    const { t: uiT } = useTranslation('ui');
    return <div role="table" className="min-w-0">
        <div role="row" className={clsx(columns, 'hidden border-y border-ui-border/70 bg-ui-surface-muted/50 px-5 py-2.5 text-xs font-medium text-ui-muted')}>
            <span role="columnheader">{uiT('order')}</span>
            <span role="columnheader">{t('matchTraffic')}</span>
            <span role="columnheader">{t('handlingAndDestination')}</span>
            <span role="columnheader">{uiT('resolver')}</span>
            <span role="columnheader" className="sr-only">{uiT('control')}</span>
        </div>
        {items.map(item => {
            const mode = ['proxy', 'direct', 'block'].includes(item.mode) ? t(item.mode) : item.mode;
            const proxy = item.mode === 'proxy';
            const summary = t('matchingConditions', { count: item.ruleCount });
            const destination = !item.target.type || item.target.type === 'default' ? t('defaultProxy') : destinations[`${item.target.type}:${item.target.id}`] ?? t('unavailableDestination');
            const Icon = item.mode === 'block' ? ShieldBan : item.mode === 'direct' ? Globe : Workflow;
            return <div key={item.id} role="row" onClick={() => onOpen(item)} className={clsx(columns, 'relative cursor-pointer border-b border-ui-border/60 px-5 py-4 transition-colors last:border-b-0 hover:bg-ui-surface-muted/50', item.disabled && 'opacity-60')}>
                <div role="cell" className="hidden font-mono text-xs tabular-nums text-ui-muted md:block">{item.index.toString().padStart(2, '0')}</div>
                <div role="cell" className="min-w-0 pr-24 md:pr-0">
                    <button type="button" className="block max-w-full truncate text-left text-sm font-semibold text-ui-heading underline-offset-4 hover:text-ui-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-focus"
                        onClick={event => { event.stopPropagation(); onOpen(item); }} title={item.name}>{item.name}</button>
                    <p className="mt-1.5 flex min-w-0 items-center gap-1.5 text-xs text-ui-muted" title={summary}>
                        <Layers size={13} className="shrink-0" aria-hidden="true" /><span className="truncate">{summary}</span>
                    </p>
                </div>
                <div role="cell" className="mt-3 flex min-w-0 items-center gap-2 md:mt-0">
                    <ArrowRight size={14} className="shrink-0 text-ui-muted" aria-hidden="true" />
                    <div className="min-w-0">
                        <Badge variant={item.mode === 'block' ? 'danger' : item.mode === 'direct' ? 'success' : 'primary'} className="gap-1.5 font-medium"><Icon size={12} aria-hidden="true" />{mode}</Badge>
                        {proxy && <p className="mt-1.5 truncate text-sm text-ui-heading" title={destination}>{destination}</p>}
                    </div>
                </div>
                <div role="cell" className="mt-2 truncate text-xs text-ui-muted md:mt-0">
                    <span className="md:hidden">{uiT('resolver')}: </span>{item.resolver ? resolverNames[item.resolver] ?? item.resolver : t('automaticResolver')}
                </div>
                <div role="cell" className="absolute right-4 top-4 flex items-center justify-end gap-2 md:static" onClick={event => event.stopPropagation()} onKeyDown={event => event.stopPropagation()}>
                    <Button type="button" size="icon" variant="outline-secondary" className="border-transparent bg-transparent" onClick={() => onPriority(item)} aria-label={uiT('changePriority')} title={uiT('changePriority')}><ArrowUpDown size={15} /></Button>
                    <Switch checked={!item.disabled} disabled={busy} onCheckedChange={() => onToggle(item)} aria-label={`${uiT('enabled')} ${item.name}`} />
                </div>
            </div>;
        })}
        {!items.length && <div className="px-5 py-12 text-center text-sm text-ui-muted">{uiT('noRecordsFound')}</div>}
    </div>;
}
