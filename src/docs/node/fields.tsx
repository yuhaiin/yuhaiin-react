

import { SettingLabel } from "@/component/v2/card";
import { SettingInputVertical, SwitchCard } from "@/component/v2/forms";

import { FC } from "react";

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

const StringField: FC<{ label: string; value: unknown; disabled?: boolean; onChange: (value: string) => void }> = ({ label, value, disabled, onChange }) => {
    const text = stringValue(value);
    if (!disabled) {
        return <SettingInputVertical label={label} value={text} onChange={onChange} />;
    }

    return (
        <div className="relative mb-4 min-w-0 max-w-full">
            <SettingLabel className="mb-2 block">{label}</SettingLabel>
            <div className="min-h-field min-w-0 max-w-full whitespace-pre-wrap break-all rounded-ui-md border border-ui-border bg-ui-surface-muted px-3.5 py-2 text-[0.9375rem] leading-normal text-ui-muted shadow-inner-subtle">
                {text || "-"}
            </div>
        </div>
    );
};

const NumberField: FC<{ label: string; value: unknown; disabled?: boolean; onChange: (value: number) => void }> = ({ label, value, disabled, onChange }) => (
    <SettingInputVertical label={label} type="number" value={String(numberValue(value))} onChange={(next) => onChange(numberValue(next))} disabled={disabled} />
);

const BoolField: FC<{ label: string; value: unknown; description?: string; disabled?: boolean; onChange: (value: boolean) => void }> = ({ label, value, description, disabled, onChange }) => (
    <SwitchCard label={label} description={description} checked={boolValue(value)} onCheckedChange={onChange} disabled={disabled} />
);

export { StringField, NumberField, BoolField };

export { stringValue, numberValue };
