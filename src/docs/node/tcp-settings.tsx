import { TCPSettingsEditor } from '@/component/tcp-settings';
import type { NodeProtocol } from '@/contract/node';
import { getProtocolConfig, patchProtocolConfig } from '@/contract/node';

type VPNType = 'wireguard' | 'amneziawg' | 'openvpn' | 'l2tp' | 'l2tpv3' | 'globalprotect' | 'softether'
    | 'ikev2' | 'anyconnect' | 'sstp' | 'fortinet' | 'nebula' | 'zerotier' | 'tailscale' | 'masque' | 'cloudflare_warp_masque';
const vpnTypes = new Set<string>(['wireguard', 'amneziawg', 'openvpn', 'l2tp', 'l2tpv3', 'globalprotect', 'softether',
    'ikev2', 'anyconnect', 'sstp', 'fortinet', 'nebula', 'zerotier', 'tailscale', 'masque', 'cloudflare_warp_masque']);
function isVPN(protocol: NodeProtocol): protocol is NodeProtocol<VPNType> { return vpnTypes.has(protocol.type); }

export function OutboundTCPSettings({ protocol, editable, onChange }: {
    protocol: NodeProtocol;
    editable: boolean;
    onChange: (value: NodeProtocol) => void;
}) {
    if (!isVPN(protocol)) return null;
    return <TCPSettingsEditor value={getProtocolConfig(protocol).tcpSettings} disabled={!editable}
        onChange={(tcpSettings) => onChange(patchProtocolConfig(protocol, { tcpSettings }))} />;
}
