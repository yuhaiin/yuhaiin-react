import { listInbounds } from '@/api/inbounds';
import { listRules } from '@/api/route';
import { Pagination } from '@/component/v2/pagination';
import { Select } from '@/component/v2/select';
import { useServerPageClamp } from '@/hooks/use-pagination';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

const BINDING_PAGE_SIZE = 100;

export function BindingTable({
    title,
    kind,
    values,
    profiles,
    onChange,
    disabled,
}: {
    title: string;
    kind: 'inbound' | 'route';
    values: Record<string, string>;
    profiles: string[];
    onChange: (v: Record<string, string>) => void;
    disabled: boolean;
}) {
    const [page, onPageChange] = useState(1);
    const query =
        kind === 'inbound'
            ? '/api/v2/inbounds?qos-bindings'
            : '/api/v2/route/rules?qos-bindings';
    const loader = kind === 'inbound' ? listInbounds : listRules;
    const { data, error, isLoading } = useSWR(
        [query, page],
        async () => {
            const result = await loader({ page, pageSize: BINDING_PAGE_SIZE });
            return {
                items: result.items.map((item) => ({
                    id: item.id,
                    name: item.name ?? item.id,
                })),
                page: result.page,
            };
        },
        { keepPreviousData: true, revalidateOnFocus: false },
    );
    useServerPageClamp(data?.page, page, onPageChange);
    const options = data?.items ?? [];
    const pageSize = BINDING_PAGE_SIZE,
        total = data?.page.total ?? 0;
    const optionsError = Boolean(error),
        optionsLoading = isLoading;
    const { t } = useTranslation('trafficControl');
    const rows = options;
    const known = new Set(rows.map((x) => x.id));
    const extra = Object.keys(values)
        .filter((id) => !known.has(id))
        .map((id) => ({ id, name: id }));
    const renderRow = (item: { id: string; name: string }) => (
        <div
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 text-sm"
        >
            <span className="min-w-0 break-all">
                {item.name || item.id}
                <span className="ml-2 text-xs text-ui-muted">
                    {item.id !== item.name ? item.id : ''}
                </span>
            </span>
            <Select
                triggerClassName="w-48 max-w-full"
                ariaLabel={item.name || item.id}
                disabled={disabled}
                value={values[item.id] ?? ''}
                items={[
                    { value: '', label: t('inherit') },
                    ...profiles.map((name) => ({ value: name, label: name })),
                ]}
                onValueChange={(value) => {
                    const next = { ...values };
                    if (value) next[item.id] = value;
                    else delete next[item.id];
                    onChange(next);
                }}
            />
        </div>
    );
    return (
        <section className="space-y-2">
            <h3 className="text-sm font-semibold">{title}</h3>
            <div className="max-h-72 overflow-auto rounded-ui-sm border border-ui-border divide-y divide-ui-border">
                {rows.map(renderRow)}
                {!rows.length && !extra.length && (
                    <p className="p-3 text-xs text-ui-muted">
                        {optionsLoading ? t('loading') : t('noBindings')}
                    </p>
                )}
            </div>
            {extra.length > 0 && (
                <details className="rounded-ui-sm border border-ui-border px-3 py-2">
                    <summary className="cursor-pointer text-xs text-ui-muted">
                        {t('existingBindingsOutsidePage', {
                            count: extra.length,
                        })}
                    </summary>
                    <div className="mt-2 max-h-72 overflow-auto divide-y divide-ui-border">
                        {extra.map(renderRow)}
                    </div>
                </details>
            )}
            {optionsError && (
                <p role="alert" className="text-xs text-ui-danger">
                    {t('bindingOptionsUnavailable')}
                </p>
            )}
            {total > pageSize && (
                <div className="flex justify-end">
                    <Pagination
                        currentPage={page}
                        totalItems={total}
                        pageSize={pageSize}
                        onPageChange={onPageChange}
                    />
                </div>
            )}
        </section>
    );
}
