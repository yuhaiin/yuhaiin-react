import { analyzeCidrs, cidrLines } from '@/common/cidr';
import { GeoIPCountrySelect } from '@/component/geoip-country-select';
import { Badge } from '@/component/v2/badge';
import { SwitchCard } from '@/component/v2/forms';
import { Textarea } from '@/component/v2/input';
import { cn, ui } from '@/component/v2/styles';
import { nonPrivateExclusions, type MatchMode, type RouteMatch } from '@/contract/system-network';
import { Check, CircleAlert, Globe2, House, Info, SlidersHorizontal } from 'lucide-react';
import { RadioGroup } from 'radix-ui';
import { useId, useState, type FC, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

const modes: { mode: MatchMode; icon: ReactNode }[] = [
    { mode: 'global', icon: <Globe2 size={18} aria-hidden="true" /> },
    { mode: 'non_private', icon: <House size={18} aria-hidden="true" /> },
    { mode: 'custom', icon: <SlidersHorizontal size={18} aria-hidden="true" /> },
];

/** Destination selection of a route rule. Switching modes keeps every field. */
export const RouteMatchEditor: FC<{ value: RouteMatch; onChange: (value: RouteMatch) => void }> = ({ value, onChange }) => {
    const { t } = useTranslation('systemNetwork');
    const patch = (fields: Partial<RouteMatch>) => onChange({ ...value, ...fields });
    const mode = value.mode as MatchMode;
    return <div className="grid min-w-0 gap-4">
        <RadioGroup.Root value={mode} onValueChange={next => patch({ mode: next })} aria-label={t('match.modeLabel')}
            className="grid min-w-0 grid-cols-1 gap-3 @3xl:grid-cols-3">
            {modes.map(item => <RadioGroup.Item key={item.mode} value={item.mode} aria-describedby={`sn-mode-${item.mode}-description`}
                className={cn('group flex min-h-11 min-w-0 flex-col gap-2 rounded-ui-lg border border-ui-border bg-ui-surface p-4 text-left',
                    'hover:border-ui-border-strong data-[state=checked]:border-ui-primary data-[state=checked]:bg-ui-selected', ui.interactive, ui.focusRing)}>
                <span className="flex w-full items-center gap-2">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-ui-md bg-ui-surface-muted text-ui-primary">{item.icon}</span>
                    <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="min-w-0 font-medium text-ui-heading">{t(`match.modes.${item.mode}.title`)}</span>
                        {item.mode === 'non_private' && <Badge variant="primary" pill>{t('match.recommended')}</Badge>}
                    </span>
                    <span aria-hidden="true" className="flex size-5 shrink-0 items-center justify-center rounded-full border border-ui-border-strong text-ui-primary-foreground group-data-[state=checked]:border-ui-primary group-data-[state=checked]:bg-ui-primary">
                        <RadioGroup.Indicator><Check size={12} /></RadioGroup.Indicator>
                    </span>
                </span>
                <span id={`sn-mode-${item.mode}-description`} className="grid gap-1.5">
                    <span className="text-sm leading-relaxed text-ui-fg">{t(`match.modes.${item.mode}.description`)}</span>
                    <span className="text-xs leading-relaxed text-ui-muted">{t(`match.modes.${item.mode}.example`)}</span>
                </span>
            </RadioGroup.Item>)}
        </RadioGroup.Root>

        {mode === 'global' && <CidrListEditor id="bypass" label={t('match.bypass.label')} help={t('match.bypass.helpGlobal')}
            placeholder={'192.168.1.0/24\n203.0.113.10'} value={value.bypassCidrs} onChange={bypassCidrs => patch({ bypassCidrs })} />}

        {mode === 'non_private' && <>
            <DefaultExclusions />
            <details className="grid gap-3">
                <summary className="cursor-pointer text-sm text-ui-muted">{t('editor.advanced')}</summary>
                <div className="mt-3 grid gap-4">
                    <CidrListEditor id="include" label={t('match.include.label')} help={t('match.include.help')}
                        placeholder={'10.8.0.0/16'} value={value.includeCidrs} onChange={includeCidrs => patch({ includeCidrs })} />
                    <CidrListEditor id="bypass" label={t('match.bypass.label')} help={t('match.bypass.helpNonPrivate')}
                        placeholder={'203.0.113.0/24\n2001:db8:100::/48'} value={value.bypassCidrs} onChange={bypassCidrs => patch({ bypassCidrs })} />
                    <p className="flex gap-2 text-xs leading-relaxed text-ui-muted"><Info size={14} className="mt-0.5 shrink-0" aria-hidden="true" />{t('match.priority')}</p>
                </div>
            </details>
        </>}

        {mode === 'custom' && <CustomMatch value={value} patch={patch} />}
    </div>;
};

const CustomMatch: FC<{ value: RouteMatch; patch: (fields: Partial<RouteMatch>) => void }> = ({ value, patch }) => {
    const { t } = useTranslation('systemNetwork');
    const countries = value.geoipCountries ?? [];
    return <div className="grid min-w-0 gap-5">
        <SubSection step={1} title={t('match.custom.cidrTitle')}>
            <CidrListEditor id="custom-cidrs" label={t('match.custom.cidrLabel')} help={t('match.custom.cidrHelp')}
                placeholder={'192.168.20.0/24\n10.0.0.0/8\n8.8.8.8/32\n2001:4860::/32'} value={value.includeCidrs} onChange={includeCidrs => patch({ includeCidrs })} />
        </SubSection>
        <SubSection step={2} title={t('match.custom.countriesTitle')}>
            <p className="text-xs leading-relaxed text-ui-muted">{t('match.custom.countriesHelp')}</p>
            <GeoIPCountrySelect value={countries.join(',')}
                onChange={next => patch({ geoipCountries: next.split(',').map(code => code.trim().toUpperCase()).filter(Boolean) })} />
        </SubSection>
        <SubSection step={3} title={t('match.custom.invertTitle')}>
            <SwitchCard label={t('match.custom.invertLabel')} checked={value.geoipInvert ?? false} onCheckedChange={geoipInvert => patch({ geoipInvert })}
                description={t(value.geoipInvert ? 'match.custom.invertOn' : 'match.custom.invertOff')} />
            {value.geoipInvert && !countries.length && <p role="status" className="text-xs text-ui-warning">{t('match.custom.invertWithoutCountries')}</p>}
        </SubSection>
        <SubSection step={4} title={t('match.custom.bypassTitle')}>
            <CidrListEditor id="custom-bypass" label={t('match.bypass.label')} help={t('match.bypass.helpCustom')}
                placeholder={'192.168.20.10\n2001:4860:4860::8888'} value={value.bypassCidrs} onChange={bypassCidrs => patch({ bypassCidrs })} />
        </SubSection>
    </div>;
};

const SubSection: FC<{ step: number; title: string; children: ReactNode }> = ({ step, title, children }) => (
    <div className="grid min-w-0 gap-2">
        <h4 className={cn(ui.cardTitle, 'flex items-center gap-2')}>
            <span aria-hidden="true" className="flex size-5 shrink-0 items-center justify-center rounded-full bg-ui-primary-soft text-xs text-ui-primary">{step}</span>{title}
        </h4>
        {children}
    </div>
);

const DefaultExclusions: FC = () => {
    const { t } = useTranslation('systemNetwork');
    return <div className={cn(ui.softPanel, 'grid gap-2 p-3')}>
        <p className="text-sm font-medium text-ui-heading">{t('match.defaults.title')}</p>
        <p className="text-xs leading-relaxed text-ui-muted">{t('match.defaults.help')}</p>
        <details>
            <summary className="cursor-pointer text-xs text-ui-muted">{t('match.defaults.show')}</summary>
            <dl className="mt-2 grid gap-2 text-xs">
                {(['private', 'local'] as const).map(group => <div key={group} className="grid gap-1">
                    <dt className="text-ui-muted">{t(`match.defaults.${group}`)}</dt>
                    <dd className="flex flex-wrap gap-1.5">{nonPrivateExclusions[group].map(cidr => <span key={cidr} className={cn(ui.chip, 'font-mono')}>{cidr}</span>)}</dd>
                </div>)}
            </dl>
        </details>
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
    const { t } = useTranslation('systemNetwork');
    const inputId = useId() + id;
    const joined = (value ?? []).join('\n');
    const [text, setText] = useState(joined);
    const [synced, setSynced] = useState(joined);
    // Follow external changes (another rule, reload) without disturbing typing.
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
                <span className="min-w-0 break-words">{t(`match.cidr.${error.reason}`, { line: error.line, value: error.value })}</span>
            </li>)}
            {errors.length > 5 && <li>{t('match.cidr.more', { count: errors.length - 5 })}</li>}
        </ul>}
        <p className="text-xs text-ui-muted" aria-live="polite">{value?.length
            ? t('match.cidr.count', { count: ipv4 + ipv6, ipv4, ipv6 })
            : t('match.cidr.hint')}</p>
    </div>;
};
