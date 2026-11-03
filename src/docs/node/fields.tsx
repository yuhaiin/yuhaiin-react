import { useSecretField } from "@/auth/secret-fields";
import { useTranslation } from "react-i18next";


import { SettingLabel } from "@/component/v2/card";
import { SettingInputVertical, SwitchCard } from "@/component/v2/forms";

import { FC, ReactNode, useId, useState } from "react";

function stringValue(value: unknown): string {
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    return "";
}

function numberValue(value: unknown): number {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) return parsed;
    }
    return 0;
}

function boolValue(value: unknown): boolean {
    return value === true;
}

const StringField: FC<{ label: string; value: unknown; secret?: boolean; disabled?: boolean; onChange: (value: string) => void }> = ({ label, value, secret, disabled, onChange }) => {
    const text = stringValue(value);
    const access = useSecretField(text, secret);
    const { t } = useTranslation("auth");
    if (!disabled) {
        return <SettingInputVertical secret={secret} disabled={access.disabled} label={label} value={text} onChange={onChange} />;
    }

    return (
        <div className="relative mb-4 min-w-0 max-w-full">
            <SettingLabel className="mb-2 block">{label}</SettingLabel>
            <div className="min-h-field min-w-0 max-w-full whitespace-pre-wrap break-all rounded-ui-md border border-ui-disabled-border bg-ui-disabled px-3.5 py-2 text-[0.9375rem] leading-normal text-ui-disabled-fg">
                {access.masked ? t("secrets.savedValue") : text || "-"}
            </div>
        </div>
    );
};

/** 0 means "unset" in node configs, so it is shown as an empty field with a placeholder and an empty field saves 0. */
const NumberField: FC<{ label: string; value: unknown; disabled?: boolean; onChange: (value: number) => void }> = ({ label, value, disabled, onChange }) => {
    const { t } = useTranslation("ui");
    const number = numberValue(value);
    return <SettingInputVertical label={label} type="number" value={number === 0 ? "" : String(number)} placeholder={t("unsetPlaceholder")} onChange={(next) => onChange(numberValue(next))} disabled={disabled} />;
};

const BoolField: FC<{ label: string; value: unknown; description?: string; disabled?: boolean; onChange: (value: boolean) => void }> = ({ label, value, description, disabled, onChange }) => (
    <SwitchCard label={label} description={description} checked={boolValue(value)} onCheckedChange={onChange} disabled={disabled} />
);

/** Rarely changed options. Starts open when any of them is set so configured values are never hidden. */
const MoreOptions: FC<{ active: boolean; children: ReactNode }> = ({ active, children }) => {
    const { t } = useTranslation("ui");
    // Only the first render decides; reacting later would collapse the section while someone clears a value.
    const [initiallyOpen] = useState(active);
    return (
        <details open={initiallyOpen || undefined}>
            <summary className="mb-3 cursor-pointer text-sm text-ui-muted">{t("moreOptions")}</summary>
            {children}
        </details>
    );
};

export { StringField, NumberField, BoolField, MoreOptions };

export { stringValue, numberValue };

export const VPNSelect: FC<{
    label: string; value: string; options: [string, string][];
    disabled: boolean; onChange: (value: string) => void;
}> = ({ label, value, options, disabled, onChange }) => {
    const id = useId();
    return <div className="min-w-0">
        <SettingLabel htmlFor={id} className="mb-2 block">{label}</SettingLabel>
        <select id={id} className="min-h-field w-full rounded-ui-md border border-ui-border bg-ui-surface px-3 py-2"
            value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)}>
            {options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
    </div>;
};
