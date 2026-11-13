import { analyzeCidrs, checkCidr, cidrLines } from '@/common/cidr';
import { GeoIPCountrySelect } from '@/component/geoip-country-select';
import { Badge } from '@/component/v2/badge';
import { Button } from '@/component/v2/button';
import { FormSection } from '@/component/v2/form-section';
import { SwitchCard } from '@/component/v2/forms';
import { Textarea } from '@/component/v2/input';
import { InputList } from '@/component/v2/listeditor';
import { cn, ui } from '@/component/v2/styles';
import type { TunProtocol } from '@/contract/inbound';
import type { Go } from '@/api/generated-contracts';
import { Check, CircleAlert, Globe2, House, Info, SlidersHorizontal } from 'lucide-react';
import { RadioGroup } from 'radix-ui';
import { useId, useState, type FC, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export type TunRouting = Go.inbound.TunRouting;
export type TunRouteMode = 'global' | 'non_private' | 'custom';

const modes: { mode: TunRouteMode; icon: ReactNode }[] = [
    { mode: 'global', icon: <Globe2 size={18} aria-hidden="true" /> },
    { mode: 'non_private', icon: <House size={18} aria-hidden="true" /> },
    { mode: 'custom', icon: <SlidersHorizontal size={18} aria-hidden="true" /> },
];

/** Networks the core keeps off the TUN in non-private mode (pkg/inbound/tun_routing.go). */
export const nonPrivateExclusions = {
    private: ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16', '100.64.0.0/10', 'fc00::/7'],
    local: ['127.0.0.0/8', '169.254.0.0/16', '0.0.0.0/8', '224.0.0.0/3', '::/16', 'fe80::/10', 'ff00::/8'],
};

/** Invalid CIDRs block saving; fields the selected mode ignores are kept but still checked by the core. */
export function tunRoutingHasErrors(routing?: TunRouting): boolean {
    if (!routing?.mode) return false;
    if (analyzeCidrs(routing.includeCidrs ?? []).errors.length || analyzeCidrs(routing.bypassCidrs ?? []).errors.length) return true;
    return routing.mode === 'custom' && !routing.includeCidrs?.length && !routing.geoipCountries?.length && !routing.geoipInvert;
}

function validLines(values: readonly string[] | undefined) {
    return (values ?? []).map(value => value.trim()).filter(value => value && !('error' in checkCidr(value)));
}

export const TunRoutingEditor: FC<{
    value: TunProtocol;
    onChange: (patch: Partial<TunProtocol>) => void;
    platform?: string;
}> = ({ value, onChange, platform }) => {
    const { t: uiT } = useTranslation('ui');
    const routing = value.routing ?? {};
    const mode = (routing.mode ?? '') as TunRouteMode | '';
    const legacyLists = Boolean(value.routes?.length || value.excludes?.length);
    const patch = (fields: Partial<TunRouting>) => onChange({ routing: { ...routing, ...fields } });
    const selectMode = (next: TunRouteMode) => {
        if (next === mode) return;
        const fields: Partial<TunRouting> = { mode: next };
        // Leaving the previous manual lists: carry them over once; the lists themselves are kept.
        if (!mode && legacyLists) {
            if (!routing.bypassCidrs?.length) fields.bypassCidrs = validLines(value.excludes);
            if (next === 'custom' && !routing.includeCidrs?.length) fields.includeCidrs = validLines(value.routes);
        }
        patch(fields);
    };

    return <FormSection title={uiT('tunRouting.title')} description={uiT('tunRouting.description')}>
        <RadioGroup.Root value={mode} onValueChange={next => selectMode(next as TunRouteMode)} aria-label={uiT('tunRouting.modeLabel')}
            className="grid min-w-0 grid-cols-1 gap-3 @3xl:grid-cols-3">
            {modes.map(item => <RadioGroup.Item key={item.mode} value={item.mode} aria-describedby={`tun-mode-${item.mode}-description`}
                className={cn('group flex min-h-11 min-w-0 flex-col gap-2 rounded-ui-lg border border-ui-border bg-ui-surface p-4 text-left',
                    'hover:border-ui-border-strong data-[state=checked]:border-ui-primary data-[state=checked]:bg-ui-selected', ui.interactive, ui.focusRing)}>
                <span className="flex w-full items-center gap-2">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-ui-md bg-ui-surface-muted text-ui-primary">{item.icon}</span>
                    <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="min-w-0 font-medium text-ui-heading">{uiT(`tunRouting.modes.${item.mode}.title`)}</span>
                        {item.mode === 'non_private' && <Badge variant="primary" pill>{uiT('tunRouting.recommended')}</Badge>}
                    </span>
                    <span aria-hidden="true" className="flex size-5 shrink-0 items-center justify-center rounded-full border border-ui-border-strong text-ui-primary-foreground group-data-[state=checked]:border-ui-primary group-data-[state=checked]:bg-ui-primary">
                        <RadioGroup.Indicator><Check size={12} /></RadioGroup.Indicator>
                    </span>
                </span>
                <span id={`tun-mode-${item.mode}-description`} className="grid gap-1.5">
                    <span className="text-sm leading-relaxed text-ui-fg">{uiT(`tunRouting.modes.${item.mode}.description`)}</span>
                    <span className="text-xs leading-relaxed text-ui-muted">{uiT(`tunRouting.modes.${item.mode}.example`)}</span>
                </span>
            </RadioGroup.Item>)}
        </RadioGroup.Root>

        {!mode && <LegacyRoutes value={value} onChange={onChange} />}
        {mode && <AddressFamilies value={value} platform={platform} />}
        {mode && platform === 'android' && <p className="flex gap-2 text-xs leading-relaxed text-ui-muted"><Info size={14} className="mt-0.5 shrink-0" aria-hidden="true" />{uiT('tunRouting.androidNote')}</p>}

        {mode === 'global' && <CidrListEditor id="tun-bypass" label={uiT('tunRouting.bypass.label')} help={uiT('tunRouting.bypass.helpGlobal')}
            placeholder={'192.168.1.0/24\n203.0.113.10'} value={routing.bypassCidrs} onChange={bypassCidrs => patch({ bypassCidrs })} />}

        {mode === 'non_private' && <>
            <DefaultExclusions />
            <CidrListEditor id="tun-include" label={uiT('tunRouting.additionalInclude.label')} help={uiT('tunRouting.additionalInclude.help')}
                placeholder={'10.8.0.0/16\n100.100.100.100'} value={routing.includeCidrs} onChange={includeCidrs => patch({ includeCidrs })} />
            <CidrListEditor id="tun-bypass" label={uiT('tunRouting.bypass.label')} help={uiT('tunRouting.bypass.helpNonPrivate')}
                placeholder={'203.0.113.0/24\n2001:db8:100::/48'} value={routing.bypassCidrs} onChange={bypassCidrs => patch({ bypassCidrs })} />
            <p className="flex gap-2 text-xs leading-relaxed text-ui-muted"><Info size={14} className="mt-0.5 shrink-0" aria-hidden="true" />{uiT('tunRouting.priority')}</p>
        </>}

        {mode === 'custom' && <CustomRouting routing={routing} patch={patch} />}

        {mode && legacyLists && <details className="text-sm">
            <summary className="cursor-pointer text-xs text-ui-muted">{uiT('tunRouting.legacy.keptSummary')}</summary>
            <div className="mt-2 grid gap-2">
                <p className="text-xs leading-relaxed text-ui-muted">{uiT('tunRouting.legacy.keptHelp')}</p>
                <div><Button size="sm" variant="outline-secondary" onClick={() => patch({ mode: '' })}>{uiT('tunRouting.legacy.restore')}</Button></div>
            </div>
        </details>}
    </FormSection>;
};

const CustomRouting: FC<{ routing: TunRouting; patch: (fields: Partial<TunRouting>) => void }> = ({ routing, patch }) => {
    const { t: uiT } = useTranslation('ui');
    const countries = routing.geoipCountries ?? [];
    const empty = !routing.includeCidrs?.length && !countries.length && !routing.geoipInvert;
    return <div className="grid min-w-0 gap-5">
        <SubSection step={1} title={uiT('tunRouting.custom.cidrTitle')}>
            <CidrListEditor id="tun-custom-cidrs" label={uiT('tunRouting.custom.cidrLabel')} help={uiT('tunRouting.custom.cidrHelp')}
                placeholder={'192.168.20.0/24\n10.0.0.0/8\n8.8.8.8/32\n2001:4860::/32'} value={routing.includeCidrs} onChange={includeCidrs => patch({ includeCidrs })} />
        </SubSection>
        <SubSection step={2} title={uiT('tunRouting.custom.countriesTitle')}>
            <p className="text-xs leading-relaxed text-ui-muted">{uiT('tunRouting.custom.countriesHelp')}</p>
            <GeoIPCountrySelect value={countries.join(',')}
                onChange={value => patch({ geoipCountries: value.split(',').map(code => code.trim().toUpperCase()).filter(Boolean) })} />
        </SubSection>
        <SubSection step={3} title={uiT('tunRouting.custom.invertTitle')}>
            <SwitchCard label={uiT('tunRouting.custom.invertLabel')} checked={routing.geoipInvert ?? false} onCheckedChange={geoipInvert => patch({ geoipInvert })}
                description={uiT(routing.geoipInvert ? 'tunRouting.custom.invertOn' : 'tunRouting.custom.invertOff')} />
            {routing.geoipInvert && !countries.length && <p role="status" className="text-xs text-ui-warning">{uiT('tunRouting.custom.invertWithoutCountries')}</p>}
        </SubSection>
        <SubSection step={4} title={uiT('tunRouting.custom.bypassTitle')}>
            <CidrListEditor id="tun-custom-bypass" label={uiT('tunRouting.bypass.label')} help={uiT('tunRouting.bypass.helpCustom')}
                placeholder={'192.168.20.10\n2001:4860:4860::8888'} value={routing.bypassCidrs} onChange={bypassCidrs => patch({ bypassCidrs })} />
        </SubSection>
        {empty && <p role="alert" className="text-sm text-ui-danger">{uiT('tunRouting.custom.empty')}</p>}
        {!empty && <p className={cn(ui.softPanel, 'p-3 text-sm leading-relaxed text-ui-fg')}>{customSummary(uiT, routing)}</p>}
    </div>;
};

function customSummary(uiT: (key: string, options?: Record<string, unknown>) => string, routing: TunRouting) {
    const countries = (routing.geoipCountries ?? []).join(', ');
    const parts: string[] = [];
    if (routing.includeCidrs?.length) parts.push(uiT('tunRouting.custom.summaryCidrs', { count: routing.includeCidrs.length }));
    if (routing.geoipInvert) parts.push(countries ? uiT('tunRouting.custom.summaryInverted', { countries }) : uiT('tunRouting.custom.summaryPublic'));
    else if (countries) parts.push(uiT('tunRouting.custom.summaryCountries', { countries }));
    let text = uiT('tunRouting.custom.summary', { targets: parts.join(uiT('tunRouting.custom.summaryJoin')) });
    if (routing.bypassCidrs?.length) text += ' ' + uiT('tunRouting.custom.summaryBypass', { count: routing.bypassCidrs.length });
    return text;
}

const SubSection: FC<{ step: number; title: string; children: ReactNode }> = ({ step, title, children }) => (
    <div className="grid min-w-0 gap-2">
        <h4 className={cn(ui.cardTitle, 'flex items-center gap-2')}>
            <span aria-hidden="true" className="flex size-5 shrink-0 items-center justify-center rounded-full bg-ui-primary-soft text-xs text-ui-primary">{step}</span>{title}
        </h4>
        {children}
    </div>
);

const DefaultExclusions: FC = () => {
    const { t: uiT } = useTranslation('ui');
    return <div className={cn(ui.softPanel, 'grid gap-2 p-3')}>
        <p className="text-sm font-medium text-ui-heading">{uiT('tunRouting.defaults.title')}</p>
        <p className="text-xs leading-relaxed text-ui-muted">{uiT('tunRouting.defaults.help')}</p>
        <details>
            <summary className="cursor-pointer text-xs text-ui-muted">{uiT('tunRouting.defaults.show')}</summary>
            <dl className="mt-2 grid gap-2 text-xs">
                {(['private', 'local'] as const).map(group => <div key={group} className="grid gap-1">
                    <dt className="text-ui-muted">{uiT(`tunRouting.defaults.${group}`)}</dt>
                    <dd className="flex flex-wrap gap-1.5">{nonPrivateExclusions[group].map(cidr => <span key={cidr} className={cn(ui.chip, 'font-mono')}>{cidr}</span>)}</dd>
                </div>)}
            </dl>
        </details>
    </div>;
};

const AddressFamilies: FC<{ value: TunProtocol; platform?: string }> = ({ value, platform }) => {
    const { t: uiT } = useTranslation('ui');
    const automatic = platform === 'android';
    const v4 = automatic || Boolean(value.portal);
    const v6 = automatic || Boolean(value.portalV6);
    const item = (label: string, on: boolean, hint: string) => <li className="flex min-w-0 items-start gap-2">
        <Badge variant={on ? 'success' : 'warning'} className="shrink-0">{label}</Badge>
        <span className="min-w-0 text-xs leading-relaxed text-ui-muted">{hint}</span>
    </li>;
    return <ul aria-label={uiT('tunRouting.families.label')} className="grid gap-2 @xl:grid-cols-2">
        {item('IPv4', v4, uiT(v4 ? 'tunRouting.families.v4On' : 'tunRouting.families.v4Off'))}
        {item('IPv6', v6, uiT(v6 ? 'tunRouting.families.v6On' : 'tunRouting.families.v6Off'))}
    </ul>;
};

const LegacyRoutes: FC<{ value: TunProtocol; onChange: (patch: Partial<TunProtocol>) => void }> = ({ value, onChange }) => {
    const { t: uiT } = useTranslation('ui');
    return <div className="grid gap-3">
        <p role="note" className="flex gap-2 rounded-ui-md bg-ui-info-soft p-3 text-sm leading-relaxed text-ui-fg">
            <Info size={16} className="mt-0.5 shrink-0 text-ui-info" aria-hidden="true" />{uiT('tunRouting.legacy.notice')}
        </p>
        <InputList title={uiT('routes')} data={value.routes} onChange={routes => onChange({ routes })} />
        <InputList title={uiT('inboundEditor.excludes')} data={value.excludes} onChange={excludes => onChange({ excludes })} />
    </div>;
};

/** Multi-line CIDR input with inline, per-line validation. Invalid lines are kept, shown and block saving. */
export const CidrListEditor: FC<{
    id: string;
    label: string;
    help: string;
    placeholder: string;
    value?: string[];
    onChange: (value: string[]) => void;
}> = ({ id, label, help, placeholder, value, onChange }) => {
    const { t: uiT } = useTranslation('ui');
    const inputId = useId() + id;
    const joined = (value ?? []).join('\n');
    const [text, setText] = useState(joined);
    const [synced, setSynced] = useState(joined);
    // Follow external changes (mode conversion, reload) without disturbing typing.
    if (synced !== joined) {
        setSynced(joined);
        if (cidrLines(text).join('\n') !== joined) setText(joined);
    }
    const { errors, ipv4, ipv6 } = analyzeCidrs(value ?? []);
    const helpId = `${inputId}-help`;
    const errorsId = `${inputId}-errors`;
    return <div className="grid min-w-0 gap-1.5">
        <label htmlFor={inputId} className="text-sm font-medium text-ui-heading">{label}</label>
        <p id={helpId} className="text-xs leading-relaxed text-ui-muted">{help}</p>
        <Textarea id={inputId} code rows={3} spellCheck={false} autoCapitalize="off" autoCorrect="off" aria-describedby={errors.length ? `${helpId} ${errorsId}` : helpId}
            aria-invalid={errors.length > 0} value={text} placeholder={placeholder}
            onChange={event => { setText(event.target.value); onChange(cidrLines(event.target.value)); }} />
        {errors.length > 0 && <ul id={errorsId} role="alert" className="grid gap-0.5 text-xs leading-normal text-ui-danger">
            {errors.slice(0, 5).map(error => <li key={`${error.line}:${error.value}`} className="flex min-w-0 items-start gap-1.5">
                <CircleAlert size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
                <span className="min-w-0 break-words">{uiT(`tunRouting.cidr.${error.reason}`, { line: error.line, value: error.value })}</span>
            </li>)}
            {errors.length > 5 && <li>{uiT('tunRouting.cidr.more', { count: errors.length - 5 })}</li>}
        </ul>}
        <p className="text-xs text-ui-muted" aria-live="polite">{value?.length
            ? uiT('tunRouting.cidr.count', { count: ipv4 + ipv6, ipv4, ipv6 })
            : uiT('tunRouting.cidr.hint')}</p>
    </div>;
};
