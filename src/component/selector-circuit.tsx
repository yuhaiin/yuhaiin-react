import type { Go } from '@/api/generated-contracts';
import { SettingInputVertical } from './v2/forms';
import SwitchComponent from './v2/switch';
import { useTranslation } from 'react-i18next';

export function SelectorCircuitEditor({ value, recovery, cooldown, onChange }: {
    value?: Go.node.CircuitConfig; recovery: number; cooldown: number; onChange: (value: Go.node.CircuitConfig) => void;
}) {
    const { t } = useTranslation('routing');
    const config = value ?? {};
    const defaults = { cooldownMs: cooldown, halfOpenConcurrency: 1, halfOpenMaxRequests: Math.max(4, recovery * 2), trialTimeoutMs: 30000 };
    return <details className="space-y-4"><summary className="cursor-pointer text-sm font-medium">{t('circuit.title')}</summary>
        <div className="flex items-center justify-between gap-3 text-sm"><span>{t('circuit.enabled')}</span><SwitchComponent ariaLabel={t('circuit.enabled')} checked={!config.disabled} onCheckedChange={enabled => onChange({ ...config, disabled: !enabled })} /></div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{(Object.keys(defaults) as (keyof typeof defaults)[]).map(key => <SettingInputVertical key={key} label={t(`circuit.${key}`)} type="number" min={key === 'halfOpenConcurrency' ? 1 : key === 'halfOpenMaxRequests' ? recovery : key === 'cooldownMs' ? 1000 : 100} disabled={config.disabled} value={String(config[key] ?? defaults[key])} onChange={text => { const n = Number(text); if (Number.isSafeInteger(n) && n > 0) onChange({ ...config, [key]: n }); }} />)}</div>
        <p className="text-xs text-ui-muted">{t('circuit.hint')}</p>
    </details>;
}
export function CircuitEvidence({ value }: { value: Go.node.SelectorCandidateStatus }) {
    const { t } = useTranslation('routing');
    const circuit = value.circuit;
    const evidence = ['unknown', 'connect', 'tcp_connect', 'response', 'reply', 'https', 'https_get', 'dns', 'doq', 'stun', 'stun_tcp', 'native'].includes(value.evidence) ? value.evidence : 'unknown';
    return <div className="mt-3 space-y-1 text-xs text-ui-muted">
        <p>{t('circuit.evidence')}: {t(`circuit.evidenceKinds.${evidence}`)}</p>
        {circuit && <>
            <p>{t('circuit.state')}: {t(`circuit.states.${circuit.state}`)} · {t(`circuit.reasons.${circuit.reason}`)}</p>
            {circuit.openUntil && <p>{t('circuit.nextTrial')}: {new Date(circuit.openUntil).toLocaleString()}</p>}
            <p>{t('circuit.permits', { inFlight: circuit.inFlight, issued: circuit.issued, recovered: circuit.recovered })}</p>
        </>}
    </div>;
}
