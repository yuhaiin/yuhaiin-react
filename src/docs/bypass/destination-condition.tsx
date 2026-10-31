import type { Go } from '@/api/generated-contracts';
import { Textarea } from '@/component/v2/input';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function DestinationCondition({ value, onChange }: { value: Go.route.DestinationExpr; onChange: (value: Go.route.DestinationExpr) => void }) {
    const { t } = useTranslation('auth');
    return <div className="space-y-3">
        <p className="text-xs text-ui-muted">{t('access.destinationHelp')}</p>
        <DestinationValues label={t('access.domains')} values={value.domains} onChange={domains => onChange({ ...value, domains })} />
        <DestinationValues label={t('access.cidrs')} values={value.cidrs} onChange={cidrs => onChange({ ...value, cidrs })} />
    </div>;
}
function DestinationValues({ label, values, onChange }: { label: string; values: string[]; onChange: (values: string[]) => void }) {
    const source = values.join('\n');
    const [edit, setEdit] = useState({ source, text: source });
    return <label className="block space-y-2 text-sm"><span>{label}</span><Textarea value={edit.source === source ? edit.text : source} onChange={event => {
        const next = event.target.value.split(/[\n,]/).map(value => value.trim()).filter(Boolean);
        setEdit({ source: next.join('\n'), text: event.target.value }); onChange(next);
    }} /></label>;
}
