import { Input } from '@/component/v2/input';
import {
    fromMbps,
    toMbps,
    type Profile,
    type Rate,
} from '@/contract/traffic-control';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// Keep an in-progress decimal (including an empty field or trailing dot)
// separate from the canonical byte rate, so parent formatting cannot erase it.
function RateInput({
    label,
    value,
    max,
    disabled,
    onChange,
}: {
    label: string;
    value: number;
    max: number;
    disabled: boolean;
    onChange: (value: number) => void;
}) {
    const [editing, setEditing] = useState(false);
    const [text, setText] = useState('');
    const canonical = Number.isFinite(value) ? String(value) : '';
    return (
        <Input
            aria-label={label}
            type="number"
            step="any"
            min={0}
            max={max}
            value={editing ? text : canonical}
            disabled={disabled}
            onFocus={() => {
                setText(canonical);
                setEditing(true);
            }}
            onBlur={() => setEditing(false)}
            onChange={(event) => {
                setText(event.currentTarget.value);
                onChange(
                    event.currentTarget.validity.badInput
                        ? NaN
                        : Number(event.currentTarget.value),
                );
            }}
        />
    );
}

function RateControl({
    title,
    value,
    onChange,
    disabled,
}: {
    title: string;
    value: Rate;
    onChange: (value: Rate) => void;
    disabled: boolean;
}) {
    const { t } = useTranslation('trafficControl');
    return (
        <div className="space-y-2">
            <span className="text-xs font-semibold text-ui-secondary">
                {title}
            </span>
            <div className="grid grid-cols-2 gap-2">
                <label className="block space-y-1 text-xs text-ui-muted">
                    <span>{t('mbps')}</span>
                    <RateInput
                        label={title + ' ' + t('mbps')}
                        max={toMbps(2 ** 40)}
                        value={toMbps(value.bytesPerSecond)}
                        disabled={disabled}
                        onChange={(next) => {
                            onChange({
                                ...value,
                                bytesPerSecond: fromMbps(next),
                                burstBytes: next === 0 ? 0 : value.burstBytes,
                            });
                        }}
                    />
                </label>
                <label className="block space-y-1 text-xs text-ui-muted">
                    <span>{t('burstKiB')}</span>
                    <RateInput
                        label={title + ' ' + t('burstKiB')}
                        max={1_048_576}
                        value={value.burstBytes / 1024}
                        disabled={disabled || value.bytesPerSecond === 0}
                        onChange={(next) => {
                            onChange({
                                ...value,
                                burstBytes: Math.round(next * 1024),
                            });
                        }}
                    />
                </label>
            </div>
        </div>
    );
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
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <RateControl
                title={t('upload')}
                value={profile.upload}
                onChange={(upload) => onChange({ ...profile, upload })}
                disabled={disabled}
            />
            <RateControl
                title={t('download')}
                value={profile.download}
                onChange={(download) => onChange({ ...profile, download })}
                disabled={disabled}
            />
        </div>
    );
}
