import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { normalizeNode, protocolTypes } from '@/contract/node';
import { NodeEditor } from './NodeEditor';
import { protocolsByGroup } from './protocol-catalog';
import english from '@/i18n/resources/en/ui.json';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

let cleanup: (() => void) | undefined;
afterEach(() => { cleanup?.(); cleanup = undefined; });

function mount(chain: object[]) {
    const node = normalizeNode({ chain } as never);
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);
    const noop = () => {};
    act(() => root.render(<NodeEditor value={node} editable groups={[]} onChange={noop} onProtocolChange={noop}
        onMoveProtocol={noop} onRemoveProtocol={noop} onAddProtocol={noop} />));
    cleanup = () => { act(() => root.unmount()); host.remove(); };
    return host;
}

it('places every protocol type in exactly one group with a name and description', () => {
    const placed = Object.values(protocolsByGroup()).flat();
    expect([...placed].sort()).toEqual([...protocolTypes].sort());
    for (const type of protocolTypes) {
        expect(english.nodeProtocol.name).toHaveProperty(type);
        expect(english.nodeProtocol.help).toHaveProperty(type);
    }
});

it('shows the chain as a path with readable step names and no simple/advanced switch', () => {
    const host = mount([{ type: 'fixed', fixed: { host: 'server.example', port: 443 } }, { type: 'tls', tls: {} }, { type: 'vmess', vmess: {} }]);
    const path = host.querySelector('[aria-label="nodeProtocol.flow"]')!.textContent;
    expect(path).toBe('nodeProtocol.localnodeProtocol.name.fixednodeProtocol.name.tlsnodeProtocol.name.vmessnodeProtocol.target');
    expect(host.textContent).not.toContain('advancedEditor');
    expect([...host.querySelectorAll('button')].some(button => button.textContent === 'nodeProtocol.addStep')).toBe(true);
});
