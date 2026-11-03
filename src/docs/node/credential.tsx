import { authAPI } from '@/auth/api';
import { usePermission } from '@/auth/context';
import type { UpstreamCredential } from '@/auth/proxy';
import { Select } from '@/component/v2/select';
import { Tooltip } from '@/component/v2/tooltip';
import { Info } from 'lucide-react';
import type { NodeProtocol } from '@/contract/node';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

const supported = ['http', 'socks5', 'yuubinsya', 'hysteria2', 'shadowsocks', 'shadowsocksr', 'trojan', 'aead'];
export function credentialKind(type: string) { return ['http', 'socks5'].includes(type) ? 'username-password' : supported.includes(type) ? 'password' : undefined; }
export function selectCredential(value: NodeProtocol, ref: string): NodeProtocol {
    const next = { ...value, credentialRef: ref || undefined };
    if (!ref) return next;
    switch (next.type) {
        case 'http': return { ...next, http: { ...next.http, user: '', password: '' } };
        case 'socks5': return { ...next, socks5: { ...next.socks5, user: '', password: '' } };
        case 'yuubinsya': return { ...next, yuubinsya: { ...next.yuubinsya, password: '' } };
        case 'hysteria2': return { ...next, hysteria2: { ...next.hysteria2, auth: '' } };
        case 'shadowsocks': return { ...next, shadowsocks: { ...next.shadowsocks, password: '' } };
        case 'shadowsocksr': return { ...next, shadowsocksr: { ...next.shadowsocksr, password: '' } };
        case 'trojan': return { ...next, trojan: { ...next.trojan, password: '' } };
        case 'aead': return { ...next, aead: { ...next.aead, password: '' } };
        default: return next;
    }
}
export function OutboundCredential({ value, editable, onChange }: { value: NodeProtocol; editable: boolean; onChange: (value: NodeProtocol) => void }) {
    const { t } = useTranslation('auth'); const permitted = usePermission('upstream-credentials:manage');
    const kind = credentialKind(value.type);
    const { data, error } = useSWR(permitted && kind ? 'upstream-credentials' : null, () => authAPI<UpstreamCredential[]>('GET', '/upstream-credentials'));
    if (!kind || !permitted && !value.credentialRef) return null;
    const items = [{ value: 'inline', label: t('inlineCredential') }, ...(data || []).filter(item => item.type === kind).map(item => ({ value: item.id, label: item.name }))];
    if (value.credentialRef && !items.some(item => item.value === value.credentialRef)) items.push({ value: value.credentialRef, label: value.credentialRef });
    const shared = value.credentialRef ? items.find(item => item.value === value.credentialRef)?.label ?? value.credentialRef : '';
    return <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-ui-muted">{t('upstreamCredential')}</span>
            <div className="min-w-48"><Select size="sm" ariaLabel={t('upstreamCredential')} value={value.credentialRef || 'inline'} items={items} disabled={!editable || !permitted} onValueChange={ref => onChange(selectCredential(value, ref === 'inline' ? '' : ref))} /></div>
            <Tooltip content={t('credentialReferenceHelp')} openOnClick><button type="button" aria-label={t('credentialReferenceHelp')} className="rounded-full p-1 text-ui-muted hover:text-ui-heading"><Info size={14} aria-hidden /></button></Tooltip>
        </div>
        {shared && <p className="text-xs text-ui-muted">{t('usingSharedCredential', { name: shared })}</p>}
        {error && <p role="alert" className="text-sm text-ui-danger">{t('requestFailed')}</p>}
    </div>;
}
