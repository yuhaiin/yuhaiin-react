import type { Go } from '@/api/generated-contracts';
import { SettingInputVertical } from './v2/forms';
import SwitchComponent from './v2/switch';
import { useTranslation } from 'react-i18next';

type Request = Go.node.SpeedTestRequest;
export function SpeedTestFields({ value, onChange, direction = 'download' }: { value: Request; onChange: (value: Request) => void; direction?: 'download' | 'upload' }) {
    const { t } = useTranslation('routing');
    const update = (changes: Partial<Request>) => onChange({ ...value, direction, ...changes });
    return <div className="space-y-3" data-testid={`${direction}-test-fields`}>
        <SettingInputVertical label={t(direction === 'upload' ? 'auto.uploadTarget' : 'auto.speedTarget')} value={value.url} onChange={url => update({ url })} placeholder={direction === 'upload' ? 'https://example.com/upload' : 'https://example.com/test.bin'} />
        {direction === 'upload' && <>
            <div className="flex items-center justify-between gap-3 text-sm"><span>{t('auto.allowUpload')}</span><SwitchComponent ariaLabel={t('auto.allowUpload')} checked={value.allowUpload ?? false} onCheckedChange={allowUpload => update({ allowUpload })} /></div>
            <p className="text-xs text-ui-muted">{t('auto.uploadHint')}</p>
        </>}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{(['maxBytes', 'durationMs', 'timeoutMs', 'dailyBudgetBytes'] as const).map(key => <SettingInputVertical key={key} type="number" min={0} label={t(`auto.${key}`)} value={String(value[key] ?? { maxBytes: 4194304, durationMs: 5000, timeoutMs: 10000, dailyBudgetBytes: 67108864 }[key])} onChange={text => { const n = Number(text); if (Number.isSafeInteger(n) && n >= 0) update({ [key]: n }); }} />)}</div>
    </div>;
}
