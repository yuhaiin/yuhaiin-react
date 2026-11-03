import type { Go } from '@/api/generated-contracts';
import { SettingSelectVertical } from '@/component/v2/forms';
import { useTranslation } from 'react-i18next';

export type TCPSettings = Go.transport.TCPSettings;

export function TCPSettingsEditor({ value, onChange, disabled = false, defaultCongestion = 'bbr' }: {
    value?: TCPSettings;
    onChange: (value: TCPSettings) => void;
    disabled?: boolean;
    defaultCongestion?: 'bbr' | 'cubic';
}) {
    const { t: uiT } = useTranslation('ui');
    const settings = value ?? {};
    return <div className="grid gap-3 rounded-ui-lg border border-ui-border p-4">
        <SettingSelectVertical label={uiT('tcpCongestionControl')} value={settings.congestionControl || ''}
            disabled={disabled}
            values={[[`${uiT('tcpDefault')} (${defaultCongestion === 'bbr' ? 'BBR v3' : 'CUBIC + HyStart++'})`, ''],
                ['Reno + HyStart++', 'reno'], ['CUBIC + HyStart++', 'cubic'], ['BBR v3', 'bbr']]}
            onChange={(congestionControl) => onChange({ ...settings, congestionControl })} />
        <SettingSelectVertical label={uiT('tcpLossRecovery')} value={settings.lossRecovery || ''}
            disabled={disabled}
            values={[[`${uiT('tcpDefault')} (${uiT('tcpClassic')})`, ''], [uiT('tcpClassic'), 'classic'], ['RACK-TLP', 'rack-tlp']]}
            onChange={(lossRecovery) => onChange({ ...settings, lossRecovery })} />
        <p className="text-xs text-ui-muted">{uiT('tcpSettingsHint')}</p>
    </div>;
}
