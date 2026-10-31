import { Input } from '@/component/v2/input';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function InboundCondition({ values, onChange }: { values: string[]; onChange: (values: string[]) => void }) {
    const { t } = useTranslation('auth');
    const source = values.join(',');
    const [edit, setEdit] = useState({ source, text: source });
    return <label className="block space-y-2"><span>{t('access.scopeIds')}</span><Input value={source === edit.source ? edit.text : source} onChange={event => {
        const next = event.target.value.split(',').map(id => id.trim()).filter(Boolean);
        setEdit({ source: next.join(','), text: event.target.value }); onChange(next);
    }} /></label>;
}
