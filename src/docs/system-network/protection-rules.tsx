import { getNetworkProtectionRules, systemNetworkKeys } from '@/api/system-network';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/component/v2/accordion';
import { Badge } from '@/component/v2/badge';
import { Button } from '@/component/v2/button';
import { useClipboard } from '@/component/v2/clipboard';
import { formatBytes } from '@/common/format';
import { cn, ui } from '@/component/v2/styles';
import type { ProtectionRules, ProtectionRuleset } from '@/contract/system-network';
import { useLocaleFormat } from '@/i18n/useLocaleFormat';
import { Copy, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

const categoryVariant: Record<string, 'success' | 'info' | 'primary' | 'danger' | 'muted' | 'warning'> = {
    loopback: 'muted', private: 'success', local: 'muted', bypass: 'info', tunnel: 'primary', own: 'primary', block: 'danger', forward: 'warning', other: 'muted',
};

/**
 * Read-only diagnostics view of the packet filter: the whole main ruleset
 * with Yuhaiin's lines marked, Yuhaiin's rule sets with counters and tables,
 * and Yuhaiin's lines in the system configuration file. Loaded only while
 * the section is open.
 */
export function ProtectionRulesCard() {
    const { t } = useTranslation('systemNetwork');
    const [open, setOpen] = useState('');
    const rules = useSWR(open === 'rules' ? systemNetworkKeys.protectionRules : null, getNetworkProtectionRules, { revalidateOnFocus: false });
    const error = rules.error ? String((rules.error as { msg?: string })?.msg ?? rules.error) : undefined;
    return <Accordion type="single" collapsible value={open} onValueChange={setOpen}>
        <AccordionItem value="rules">
            <AccordionTrigger>{t('protection.rules.title')}</AccordionTrigger>
            <AccordionContent>
                <p className="mt-0 text-xs leading-relaxed text-ui-muted">{t('protection.rules.help')}</p>
                {error && <p role="alert" className="text-sm text-ui-danger">{error}</p>}
                {!rules.data && !error && <p className="text-sm text-ui-muted">{t('protection.rules.loading')}</p>}
                {rules.data && <RulesView data={rules.data} refreshing={rules.isValidating} onRefresh={() => void rules.mutate()} />}
            </AccordionContent>
        </AccordionItem>
    </Accordion>;
}

function RulesView({ data, refreshing, onRefresh }: { data: ProtectionRules; refreshing: boolean; onRefresh: () => void }) {
    const { t } = useTranslation('systemNetwork');
    const format = useLocaleFormat();
    const clipboard = useClipboard({ usePromptAsFallback: true });
    const filters = data.main.filter(m => m.kind === 'filter');
    const firstFilterIsOurs = filters.length === 0 || filters[0].yuhaiin;
    return <div className="grid min-w-0 gap-5">
        <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-ui-muted">{t('protection.rules.readAt', { time: format.time(new Date(data.readAt * 1000)) })}</span>
            <span className="grow" />
            <Button size="sm" variant="outline-secondary" loading={refreshing} onClick={onRefresh}><RefreshCw size={15} />{t('protection.refresh')}</Button>
            <Button size="sm" variant="outline-secondary" disabled={!data.raw} onClick={() => void clipboard.copy(data.raw)}>
                <Copy size={15} />{t(clipboard.copied ? 'protection.rules.copied' : 'protection.rules.copy')}</Button>
            {clipboard.manualCopyModal}
        </div>
        {!data.available && <p role="alert" className="m-0 text-sm text-ui-danger">{data.reason}</p>}
        {data.errors && data.errors.length > 0 && <ul className="m-0 grid gap-1 pl-4 text-xs text-ui-warning">{data.errors.map(e => <li key={e} className="break-words">{e}</li>)}</ul>}

        <section className="grid min-w-0 gap-2" aria-label={t('protection.rules.main')}>
            <h3 className="m-0 text-sm font-medium text-ui-heading">{t('protection.rules.main')}</h3>
            <p className="m-0 text-xs text-ui-muted">{t('protection.rules.mainHelp')}</p>
            {!firstFilterIsOurs && <p role="alert" className="m-0 text-xs text-ui-warning">{t('protection.rules.notFirst')}</p>}
            {data.main.length === 0 ? <p className="m-0 text-sm text-ui-muted">{t('protection.rules.empty')}</p>
                : <ol className="m-0 grid list-none gap-1 p-0">
                    {data.main.map((m, i) => <li key={i} data-yuhaiin={m.yuhaiin || undefined}
                        className={cn('flex min-w-0 items-start gap-2 rounded-ui-sm border px-2 py-1 text-xs',
                            m.yuhaiin ? 'border-ui-primary/60 bg-ui-selected/40' : 'border-ui-border')}>
                        <span className="w-6 shrink-0 text-right font-mono text-ui-muted">{i + 1}</span>
                        <span className={cn(ui.chip, 'shrink-0')}>{t(`protection.rules.kind.${m.kind}`, { defaultValue: m.kind })}</span>
                        <code className="min-w-0 grow break-all font-mono text-ui-fg">{m.text}</code>
                        {m.yuhaiin && <Badge variant="primary" className="shrink-0">Yuhaiin</Badge>}
                    </li>)}
                </ol>}
        </section>

        {data.rulesets.map(rs => <Ruleset key={rs.name} set={rs} />)}

        <section className="grid min-w-0 gap-2">
            <h3 className="m-0 text-sm font-medium text-ui-heading">{t('protection.rules.config', { path: data.config.path ?? '' })}</h3>
            {data.config.error ? <p className="m-0 text-xs text-ui-danger">{data.config.error}</p>
                : (data.config.lines ?? []).length === 0 ? <p className="m-0 text-sm text-ui-muted">{t('protection.rules.configNone')}</p>
                    : <ul className="m-0 grid gap-1 p-0">{(data.config.lines ?? []).map(l => <li key={l.number} className="flex min-w-0 items-start gap-2 text-xs">
                        <span className="w-8 shrink-0 text-right font-mono text-ui-muted">{l.number}</span>
                        <code className="min-w-0 grow break-all font-mono">{l.text}</code>
                        <Badge variant={l.managed ? 'primary' : 'muted'} className="shrink-0">{t(l.managed ? 'protection.rules.managed' : 'protection.rules.manual')}</Badge>
                    </li>)}</ul>}
        </section>
    </div>;
}

function Ruleset({ set }: { set: ProtectionRuleset }) {
    const { t } = useTranslation('systemNetwork');
    const format = useLocaleFormat();
    return <section className="grid min-w-0 gap-2" aria-label={set.name}>
        <h3 className="m-0 flex flex-wrap items-center gap-2 text-sm font-medium text-ui-heading">
            {t(`protection.rules.purpose.${set.purpose}`, { defaultValue: set.purpose })}
            <code className="font-mono text-xs font-normal text-ui-muted">{set.name}</code>
        </h3>
        {set.error && <p className="m-0 text-xs text-ui-warning">{set.error}</p>}
        {set.rules.length === 0 ? <p className="m-0 text-sm text-ui-muted">{t('protection.rules.noRules')}</p>
            : <div className="min-w-0 overflow-x-auto">
                <table className="w-full min-w-[36rem] border-collapse text-xs">
                    <thead><tr className="text-left text-ui-muted">
                        <th className="py-1 pr-2 font-normal">{t('protection.rules.category')}</th>
                        <th className="py-1 pr-2 font-normal">{t('protection.rules.rule')}</th>
                        <th className="py-1 pr-2 text-right font-normal">{t('protection.rules.packets')}</th>
                        <th className="whitespace-nowrap py-1 pr-2 text-right font-normal">{t('protection.rules.bytes')}</th>
                        <th className="whitespace-nowrap py-1 pl-2 text-right font-normal">{t('protection.rules.states')}</th>
                    </tr></thead>
                    <tbody>{set.rules.map((r, i) => <tr key={i} className={cn('border-t border-ui-border align-top', r.category === 'block' && 'bg-ui-danger-soft/40')}>
                        <td className="py-1 pr-2"><Badge variant={categoryVariant[r.category] ?? 'muted'}>{t(`protection.rules.categories.${r.category}`, { defaultValue: r.category })}</Badge></td>
                        <td className="py-1 pr-2"><code className="break-all font-mono">{r.text}</code></td>
                        <td className="py-1 pr-2 text-right font-mono">{r.counters ? format.number(r.packets) : '—'}</td>
                        <td className="whitespace-nowrap py-1 pr-2 text-right font-mono" title={r.counters ? `${format.number(r.bytes)} B` : undefined}>{r.counters ? (r.bytes < 1024 ? `${r.bytes} B` : formatBytes(r.bytes, 1, ' ')) : '—'}</td>
                        <td className="py-1 pl-2 text-right font-mono">{r.counters ? format.number(r.states) : '—'}</td>
                    </tr>)}</tbody>
                </table>
            </div>}
        {(set.tables ?? []).map(tb => <details key={tb.name} className="rounded-ui-sm border border-ui-border px-2 py-1 text-xs">
            <summary className="cursor-pointer"><code className="font-mono">&lt;{tb.name}&gt;</code> <span className="text-ui-muted">{t('protection.rules.tableCount', { count: tb.count })}</span></summary>
            <div className="mt-2 flex flex-wrap gap-1">{tb.entries.map(e => <span key={e} className={cn(ui.chip, 'font-mono')}>{e}</span>)}</div>
            {tb.truncated && <p className="m-0 mt-1 text-ui-muted">{t('protection.rules.truncated', { shown: tb.entries.length, count: tb.count })}</p>}
        </details>)}
    </section>;
}
