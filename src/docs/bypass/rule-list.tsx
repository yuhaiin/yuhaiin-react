import { Button } from '@/component/v2/button';
import { Dropdown, DropdownCheckboxItem, DropdownContent, DropdownItem, DropdownTrigger } from '@/component/v2/dropdown';
import type { RuleItem } from '@/contract/route';
import clsx from 'clsx';
import { ArrowRight, ArrowUpDown, Globe, MoreHorizontal, ShieldBan, Workflow } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function RuleList({ items, onOpen, onPriority, onToggle, destinations, resolverNames, busy }: {
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
    return <ul className="m-0 list-none p-0" aria-label={uiT('routeRules')}>
        {items.map(item => {
            const proxy = item.mode === 'proxy';
            const destination = !item.target.type || item.target.type === 'default' ? t('defaultProxy') : destinations[`${item.target.type}:${item.target.id}`] ?? t('unavailableDestination');
            const label = proxy ? destination : t(item.mode, { defaultValue: item.mode });
            const Icon = item.mode === 'block' ? ShieldBan : item.mode === 'direct' ? Globe : Workflow;
            const tone = item.mode === 'block' ? 'text-ui-danger bg-ui-danger-soft/50' : item.mode === 'direct' ? 'text-ui-success bg-ui-success-soft/50' : 'text-ui-primary bg-ui-primary-soft/50';
            return <li key={item.id} onClick={() => onOpen(item)} className={clsx('group flex cursor-pointer items-center gap-3 border-b border-ui-border/45 px-2 py-3.5 transition-colors last:border-b-0 hover:rounded-ui-lg hover:bg-ui-surface-muted/65 sm:gap-4 sm:px-3', item.disabled && 'opacity-55')}>
                <span className="hidden w-5 shrink-0 text-center font-mono text-xs tabular-nums text-ui-muted/65 sm:block">{item.index.toString().padStart(2, '0')}</span>
                <span className={clsx('flex h-9 w-9 shrink-0 items-center justify-center rounded-ui-md', tone)}><Icon size={18} aria-hidden="true" /></span>
                <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-initial sm:flex-row sm:items-center sm:gap-4">
                    <div className="min-w-0 sm:max-w-[18rem]">
                        <div className="flex min-w-0 items-center gap-2">
                            <button type="button" className="min-w-0 truncate text-left text-[15px] font-medium text-ui-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-focus" title={item.name}
                                onClick={event => { event.stopPropagation(); onOpen(item); }}>{item.name}</button>
                            <span className={clsx('h-1.5 w-1.5 shrink-0 rounded-full', item.disabled ? 'bg-ui-muted/50' : 'bg-ui-success')} role="img" aria-label={item.disabled ? uiT('off') : uiT('enabled')} title={item.disabled ? uiT('off') : uiT('enabled')} />
                            {item.disabled && <span className="shrink-0 text-xs text-ui-muted">{uiT('off')}</span>}
                        </div>
                        {(item.ruleCount !== 1 || item.resolver) && <p className="mt-1 truncate text-xs text-ui-muted">
                            {item.ruleCount !== 1 && t('matchingConditions', { count: item.ruleCount })}
                            {item.ruleCount !== 1 && item.resolver && ' · '}
                            {item.resolver && `${uiT('resolver')}: ${resolverNames[item.resolver] ?? item.resolver}`}
                        </p>}
                    </div>
                    <div className="flex min-w-0 items-center gap-2 text-sm">
                        {proxy && <span className="shrink-0 text-xs text-ui-muted">{t('proxy')}</span>}
                        <ArrowRight size={14} className="shrink-0 text-ui-muted/60" aria-hidden="true" />
                        <span className="truncate text-ui-fg" title={label}>{label}</span>
                    </div>
                </div>
                <div className="shrink-0" onClick={event => event.stopPropagation()} onKeyDown={event => event.stopPropagation()}>
                    <Dropdown><DropdownTrigger asChild>
                        <Button type="button" size="icon" variant="outline-secondary" className="border-transparent bg-transparent text-ui-muted/70" aria-label={t('ruleActions', { name: item.name })} title={t('ruleActions', { name: item.name })}><MoreHorizontal size={18} /></Button>
                    </DropdownTrigger><DropdownContent align="end">
                        <DropdownItem onSelect={() => onPriority(item)}><ArrowUpDown size={15} className="mr-2" />{uiT('changePriority')}</DropdownItem>
                        <DropdownCheckboxItem checked={!item.disabled} disabled={busy} onCheckedChange={() => onToggle(item)}>{uiT('enabled')}</DropdownCheckboxItem>
                    </DropdownContent></Dropdown>
                </div>
            </li>;
        })}
        {!items.length && <li className="py-12 text-center text-sm text-ui-muted">{uiT('noRecordsFound')}</li>}
    </ul>;
}
