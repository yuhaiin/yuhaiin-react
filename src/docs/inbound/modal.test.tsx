import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { SWRConfig } from 'swr';
import { expect, it, vi } from 'vitest';
import { createDefaultInbound, normalizeInbound, type Inbound } from '@/contract/inbound';
import { secretPlaceholder } from '@/auth/secret-fields';

vi.mock('@/auth/context', () => ({ useSession: () => ({ principal: { credentialType: 'session', permissions: ['inbounds:write', 'inbounds:read'] } }) }));
vi.mock('react-i18next', () => { const t = (key: string) => key; return { useTranslation: () => ({ t }) }; });
const api = vi.hoisted(() => ({ getInbound: vi.fn(), saveInbound: vi.fn() }));
vi.mock('@/api/inbounds', async (importOriginal) => ({
    ...await importOriginal<typeof import('@/api/inbounds')>(),
    getInbound: api.getInbound,
    saveInbound: api.saveInbound,
    getInboundCapabilities: async () => ({ platform: 'linux', protocols: ['http'] }),
    listInboundEvents: async () => [],
    getInboundSecrets: async () => ({}),
}));
import { InboundModal } from './modal';

function httpInbound(password: string): Inbound {
    const base = createDefaultInbound('http');
    return normalizeInbound({ ...base, id: 'http', name: 'http', protocol: { type: 'http', http: { username: 'u', password } } } as Inbound);
}

it('reloads stale secret references after a conflict and saves with the fresh ones', async () => {
    const stale = `${secretPlaceholder}.old.signature`, fresh = `${secretPlaceholder}.new.signature`;
    api.getInbound.mockResolvedValueOnce(httpInbound(stale)).mockResolvedValue(httpInbound(fresh));
    api.saveInbound
        .mockRejectedValueOnce({ code: 409, msg: 'stale', raw: { error: { code: 'secret_reference_conflict', message: 'stale' } } })
        .mockImplementation(async (value: Inbound) => value);
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);
    const save = () => [...host.querySelectorAll<HTMLButtonElement>('button')].find(button => button.textContent?.includes('save'))!;
    try {
        await act(async () => root.render(<SWRConfig value={{ provider: () => new Map() }}>
            <InboundModal show id="http" presentation="inline" onHide={() => {}} onDelete={() => {}} />
        </SWRConfig>));
        await act(async () => { save().click(); });
        await act(async () => { await Promise.resolve(); });
        expect(host.querySelector('[role=alert]')?.textContent).toBe('secretReferenceRefreshed');
        expect(api.saveInbound).toHaveBeenCalledTimes(1);
        await act(async () => { save().click(); });
        expect(api.saveInbound).toHaveBeenCalledTimes(2);
        const second = api.saveInbound.mock.calls[1][0] as Inbound;
        if (second.protocol.type !== 'http') throw new Error('expected HTTP');
        expect(second.protocol.http.password).toBe(fresh);
    } finally {
        act(() => root.unmount());
        host.remove();
    }
});
