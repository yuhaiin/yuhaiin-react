import { Button } from '@/component/v2/button';
import { Dropdown, DropdownCheckboxItem, DropdownContent, DropdownItem, DropdownTrigger } from '@/component/v2/dropdown';
import type { RuleItem } from '@/contract/route';
import clsx from 'clsx';
import { ArrowRight, ArrowUpDown, Globe, MoreHorizontal, ShieldBan, Workflow } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function RuleList({ items, selectedId, onOpen, onPriority, onToggle, destinations, resolverNames, busy }: {
    items: RuleItem[];
    selectedId?: string;
    destinations: Record<string, string>;
    resolverNames: Record<string, string>;
    busy: boolean;
    onOpen: (item: RuleItem) => void;
    onPriority: (item: RuleItem) => void;
    onToggle: (item: RuleItem) => void;
}) {
    const { t } = useTranslation('routing');
    const { t: uiT } = useTranslation('ui');
    return <ul className="m-0 list-none space-y-1 p-0" aria-label={uiT('routeRules')}>
        {items.map(item => {
            const proxy = item.mode === 'proxy';
            const destination = !item.target.type || item.target.type === 'default' ? t('defaultProxy') : destinations[`${item.target.type}:${item.target.id}`] ?? t('unavailableDestination');
            const label = proxy ? destination : t(item.mode, { defaultValue: item.mode });
            const Icon = item.mode === 'block' ? ShieldBan : item.mode === 'direct' ? Globe : Workflow;
            const tone = item.mode === 'block' ? 'text-ui-danger' : item.mode === 'direct' ? 'text-ui-success' : 'text-ui-primary';
            const selected = item.id === selectedId;
            return <li key={item.id} className={clsx('flex min-w-0 items-start gap-1 rounded-ui-lg transition-colors', selected ? 'bg-ui-primary-soft/65' : 'hover:bg-ui-surface-muted/65')}>
                <button type="button" aria-current={selected ? 'true' : undefined} aria-label={item.name} title={item.name} onClick={() => onOpen(item)}
                    className="flex min-w-0 flex-1 items-start gap-2.5 rounded-ui-lg py-3 pl-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-focus">
                    <span className="mt-0.5 w-4 shrink-0 text-center font-mono text-[11px] tabular-nums text-ui-muted/65">{item.index.toString().padStart(2, '0')}</span>
                    <div className={clsx('min-w-0 flex-1', item.disabled && 'opacity-60')}>
                        <div className="flex min-w-0 items-center gap-2">
                            <span className="min-w-0 flex-1 truncate text-sm font-medium text-ui-heading">{item.name}</span>
                            <span className={clsx('h-1.5 w-1.5 shrink-0 rounded-full', item.disabled ? 'bg-ui-muted/50' : 'bg-ui-success')} role="img" aria-label={item.disabled ? uiT('off') : uiT('enabled')} />
                        </div>
                        <div className="mt-1.5 flex min-w-0 items-center gap-1.5 text-xs text-ui-muted"><Icon size={13} className={clsx('shrink-0', tone)} aria-hidden="true" />
                            {proxy && <ArrowRight size={11} className="shrink-0" aria-hidden="true" />}<span className="truncate" title={label}>{label}</span>
                        </div>
                        <p className="mt-1 truncate text-[11px] text-ui-muted/80">{item.disabled ? `${uiT('off')} · ` : ''}{t('matchingConditions', { count: item.ruleCount })}
                            {item.resolver && ` · ${uiT('resolver')}: ${resolverNames[item.resolver] ?? item.resolver}`}</p>
                    </div>
                </button>
                <Dropdown><DropdownTrigger asChild>
                    <Button type="button" size="icon" variant="outline-secondary" className="mt-2 mr-1 h-8 w-8 border-transparent bg-transparent text-ui-muted/70" aria-label={t('ruleActions', { name: item.name })}><MoreHorizontal size={16} /></Button>
                </DropdownTrigger><DropdownContent align="end">
                    <DropdownItem disabled={busy} onSelect={() => onPriority(item)}><ArrowUpDown size={15} className="mr-2" />{uiT('changePriority')}</DropdownItem>
                    <DropdownCheckboxItem checked={!item.disabled} disabled={busy} onCheckedChange={() => onToggle(item)}>{uiT('enabled')}</DropdownCheckboxItem>
                </DropdownContent></Dropdown>
            </li>;
        })}
        {!items.length && <li className="py-12 text-center text-sm text-ui-muted">{uiT('noRecordsFound')}</li>}
    </ul>;
}
