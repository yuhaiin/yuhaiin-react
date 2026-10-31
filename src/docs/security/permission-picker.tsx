import { MultiSelectChips } from '@/component/v2/multi-select';
import { useTranslation } from 'react-i18next';

/** Groups `resource:action` permissions by resource and offers each action as a chip. */
export function PermissionPicker({ legend, permissions, value, onChange, isDisabled, disabled }: {
    legend: string;
    permissions: string[];
    value: string[];
    onChange: (value: string[]) => void;
    isDisabled?: (permission: string) => boolean;
    disabled?: boolean;
}) {
    const { t } = useTranslation('auth');
    const groups = new Map<string, string[]>();
    for (const permission of permissions) {
        const resource = permission.split(':')[0];
        groups.set(resource, [...groups.get(resource) ?? [], permission]);
    }
    return <fieldset disabled={disabled} className="min-w-0 space-y-2">
        <legend className="flex w-full items-center justify-between gap-2 text-sm font-medium"><span>{legend}</span><span className="text-xs font-normal tabular-nums text-ui-muted">{t('selectedCount', { count: value.length })}</span></legend>
        <div className="grid gap-x-6 rounded-ui-md border border-ui-border px-3 py-1 xl:grid-cols-2">
            {[...groups].map(([resource, items]) => <div key={resource} className="grid min-w-0 gap-2 border-b border-ui-border/40 py-2 last:border-b-0 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-center">
                <span className="break-words text-sm text-ui-heading">{resource}</span>
                <MultiSelectChips value={value} onChange={onChange} options={items.map(item => ({ value: item, label: item.slice(resource.length + 1), ariaLabel: item, disabled: isDisabled?.(item) }))} />
            </div>)}
        </div>
    </fieldset>;
}
