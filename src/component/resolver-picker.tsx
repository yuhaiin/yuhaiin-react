import { listResolvers } from '@/api/resolvers';
import { collectPages } from '@/api/paging';
import { ResolverModal } from '@/component/resolver-editor';
import { Button } from '@/component/v2/button';
import { Select } from '@/component/v2/select';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

export function ResolverPicker({ value, onChange, label }: { value: string; label?: string; onChange: (id: string) => void }) {
    const { t } = useTranslation('routing');
    const [creating, setCreating] = useState(false);
    const { data, error, mutate } = useSWR('/api/v2/resolvers/options', () => collectPages(listResolvers));
    const items = [{ value: '', label: t('automaticDNS') }, ...(data?.items ?? []).map(item => ({ value: item.id, label: item.name }))];
    if (value && !items.some(item => item.value === value)) items.push({ value, label: t('unavailableResolver') });
    return <div className="space-y-2">
        <Select ariaLabel={label ?? t("dnsResolver")} value={value} items={items} onValueChange={onChange} />
        <Button size="sm" variant="outline-secondary" onClick={() => setCreating(true)}>{t('addResolver')}</Button>
        {error && <p role="alert" className="text-sm text-ui-danger">{t('resolversFailed')} <Button size="sm" onClick={() => void mutate()}>{t('retry')}</Button></p>}
        <ResolverModal id="" isNew show={creating} onHide={() => setCreating(false)} onSaved={resolver => { void mutate(); onChange(resolver.id); }} />
    </div>;
}
