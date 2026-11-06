import { Input } from '@/component/v2/input';
import {
    fromMbps,
    toMbps,
    type Profile,
    type Rate,
} from '@/contract/traffic-control';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// Keep an in-progress decimal (including a trailing dot) separate from the
// canonical byte rate, so parent formatting cannot erase it. An empty field
// means unlimited (0) when `emptyIsZero` is set.
function RateInput({
    label,
    value,
    max,
    disabled,
    placeholder,
    emptyIsZero = false,
    onChange,
}: {
    label: string;
    value: number;
    max: number;
    disabled: boolean;
    placeholder?: string;
    emptyIsZero?: boolean;
    onChange: (value: number) => void;
}) {
    const [editing, setEditing] = useState(false);
    const [text, setText] = useState('');
    const canonical = !Number.isFinite(value) || (emptyIsZero && value === 0) ? '' : String(value);
    return (
        <Input
            aria-label={label}
            type="number"
            step="any"
            min={0}
            max={max}
            placeholder={placeholder}
            value={editing ? text : canonical}
            disabled={disabled}
            onFocus={() => {
                setText(canonical);
                setEditing(true);
            }}
            onBlur={() => setEditing(false)}
            onChange={(event) => {
                setText(event.currentTarget.value);
                const empty = event.currentTarget.value === '';
                onChange(
                    event.currentTarget.validity.badInput
                        ? NaN
                        : empty
                          ? emptyIsZero ? 0 : NaN
                          : Number(event.currentTarget.value),
                );
            }}
        />
    );
}

function Direction({ direction }: { direction: 'upload' | 'download' }) {
    const Icon = direction === 'upload' ? ArrowUp : ArrowDown;
    return <Icon size={14} aria-hidden="true" className="shrink-0 text-ui-muted" />;
}

function RateField({
    direction,
    title,
    value,
    onChange,
    disabled,
}: {
    direction: 'upload' | 'download';
    title: string;
    value: Rate;
    onChange: (value: Rate) => void;
    disabled: boolean;
}) {
    const { t } = useTranslation('trafficControl');
    // Remember the burst across a temporary switch to unlimited, because an
    // unlimited direction must not carry a burst.
    const [lastBurst, setLastBurst] = useState(value.burstBytes);
    if (value.burstBytes && value.burstBytes !== lastBurst) setLastBurst(value.burstBytes);
    return (
        <label className="block min-w-0 space-y-1">
            <span className="flex items-center gap-1.5 text-xs font-medium text-ui-secondary">
                <Direction direction={direction} />
                {title}
            </span>
            <span className="flex items-center gap-2">
                <RateInput
                    label={title + ' ' + t('mbps')}
                    max={toMbps(2 ** 40)}
                    value={toMbps(value.bytesPerSecond)}
                    placeholder={t('unlimited')}
                    emptyIsZero
                    disabled={disabled}
                    onChange={(next) => {
                        onChange({
                            ...value,
                            bytesPerSecond: fromMbps(next),
                            burstBytes: next === 0 ? 0 : value.burstBytes || lastBurst,
                        });
                    }}
                />
                <span className="shrink-0 text-xs text-ui-muted">Mbps</span>
            </span>
        </label>
    );
}

function BurstField({ title, value, onChange, disabled }: {
    title: string;
    value: Rate;
    onChange: (value: Rate) => void;
    disabled: boolean;
}) {
    const { t } = useTranslation('trafficControl');
    return (
        <label className="block min-w-0 space-y-1 text-xs text-ui-muted">
            <span>{title}</span>
            <span className="flex items-center gap-2">
                <RateInput
                    label={title + ' ' + t('burstKiB')}
                    max={1_048_576}
                    value={value.burstBytes / 1024}
                    placeholder={t('burstDefault')}
                    emptyIsZero
                    disabled={disabled || value.bytesPerSecond === 0}
                    onChange={(next) => onChange({ ...value, burstBytes: Math.round(next * 1024) })}
                />
                <span className="shrink-0">KiB</span>
            </span>
        </label>
    );
}

/** One-line description of a profile, e.g. "↑ 10 Mbps · ↓ unlimited". */
export function useProfileSummary() {
    const { t } = useTranslation('trafficControl');
    const rate = (value: Rate) => value.bytesPerSecond ? `${toMbps(value.bytesPerSecond)} Mbps` : t('unlimited');
    return (profile: Profile) => `↑ ${rate(profile.upload)} · ↓ ${rate(profile.download)}`;
}

export function ProfileEditor({
    profile,
    onChange,
    disabled,
}: {
    profile: Profile;
    onChange: (next: Profile) => void;
    disabled: boolean;
}) {
    const { t } = useTranslation('trafficControl');
    const limited = Boolean(profile.upload.bytesPerSecond || profile.download.bytesPerSecond);
    return (
        <div className="space-y-2">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <RateField direction="upload" title={t('upload')} value={profile.upload}
                    onChange={(upload) => onChange({ ...profile, upload })} disabled={disabled} />
                <RateField direction="download" title={t('download')} value={profile.download}
                    onChange={(download) => onChange({ ...profile, download })} disabled={disabled} />
            </div>
            {limited && (
                <details className="text-xs">
                    <summary className="cursor-pointer select-none text-ui-muted hover:text-ui-heading">{t('burstSettings')}</summary>
                    <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <BurstField title={t('upload')} value={profile.upload}
                            onChange={(upload) => onChange({ ...profile, upload })} disabled={disabled} />
                        <BurstField title={t('download')} value={profile.download}
                            onChange={(download) => onChange({ ...profile, download })} disabled={disabled} />
                    </div>
                    <p className="mt-2 text-ui-muted">{t('burstHint')}</p>
                </details>
            )}
        </div>
    );
}
