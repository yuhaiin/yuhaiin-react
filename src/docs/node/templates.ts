import { createDefaultProtocol, type NodeProtocol } from '@/contract/node';

export const nodeTemplates = ['direct', 'socks5', 'http', 'shadowsocks', 'trojan', 'ssh', 'set'] as const;
export type NodeTemplate = typeof nodeTemplates[number];

export function templateChain(template: NodeTemplate): NodeProtocol[] {
    switch (template) {
        case 'direct': return [createDefaultProtocol('direct')];
        case 'set': return [createDefaultProtocol('set')];
        case 'trojan': return [createDefaultProtocol('simple'), createDefaultProtocol('tls'), createDefaultProtocol('trojan')];
        default: return [createDefaultProtocol('simple'), createDefaultProtocol(template)];
    }
}

export function chainTemplate(chain: NodeProtocol[]): NodeTemplate | 'custom' {
    const types = chain.map(step => step.type).join(',');
    return nodeTemplates.find(template => templateChain(template).map(step => step.type).join(',') === types) ?? 'custom';
}
