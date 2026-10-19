import { afterAll, afterEach, beforeAll, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { deleteFakeIPEntry, listFakeIPEntries } from './resolvers';
import { getTotalFlow } from './connections';
import { blockHistory } from './route';
import { setApiUrl } from '@/common/apiurl';
import { getGatewayConfig, saveGatewayConfig, refreshGatewayFilter } from './gateway';
import { newAction, type GatewayWorkspaceDocument } from '@/contract/gateway';

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => { server.resetHandlers(); localStorage.clear(); window.location.hash = '/'; });
afterAll(() => server.close());

it('loads, saves and refreshes the nested Gateway workspace through its real RPC adapter', async () => {
    setApiUrl('http://controller');
    const workspace: GatewayWorkspaceDocument = {
        version: 2, revision: 4, gateways: [{
            id: 'site', name: 'Site', enabled: true, revision: 1,
            policies: [], backendPools: [], filters: [],
            interception: { mode: "https_mitm", domains: ["app.example.com"], excludeDomains: [], ports: [], sources: [], processes: [], unknownTls: "passthrough" },
            fallback: newAction('block'), maxBodyBytes: 0,
        }],
    };
    server.use(
        http.post('http://controller/api/v2/rpc/gateway.workspace.get', () => HttpResponse.json(workspace)),
        http.post('http://controller/api/v2/rpc/gateway.workspace.put', async ({ request }) => {
            expect(await request.json()).toEqual({
                ...workspace,
                gateways: [{ ...workspace.gateways[0], name: 'Updated site' }],
            });
            return HttpResponse.json({ ...workspace, revision: 5,
                gateways: [{ ...workspace.gateways[0], name: 'Updated site' }],
            });
        }),
        http.post('http://controller/api/v2/rpc/gateway.filters.refresh', async ({ request }) => {
            expect(await request.json()).toEqual({ id: 'filter' });
            return HttpResponse.json({ ...workspace, revision: 6 });
        }),
    );
    const config = await getGatewayConfig();
    expect(config).toMatchObject({ revision: 4, gateways: [{ id: 'site' }], rules: [], upstreams: [],
        interceptions: [{ gatewayId: 'site', mode: 'https_mitm', domains: ['app.example.com'] }],
    });
    config.gateways[0].name = 'Updated site';
    await expect(saveGatewayConfig(config)).resolves.toMatchObject({
        revision: 5, gateways: [{ name: 'Updated site' }],
    });
    await expect(refreshGatewayFilter('filter')).resolves.toMatchObject({ revision: 6, gateways: [{ id: 'site' }] });
});

it('loads block history through its literal RPC route instead of a rule ID', async () => {
    setApiUrl('http://controller');
    server.use(
        http.post('http://controller/api/v2/rpc/route.rule.get', () =>
            HttpResponse.json({ error: { code: 'not_found', message: 'not found' } }, { status: 404 })),
        http.post('http://controller/api/v2/rpc/route.rules.block_history', () =>
            HttpResponse.json({ items: [], dumpProcessEnabled: false })),
    );
    await expect(blockHistory()).resolves.toEqual({ items: [], dumpProcessEnabled: false });
});

it('does not redirect a newly selected controller when an old request returns 401', async () => {
    let complete!: () => void;
    let started: () => void;
    const received = new Promise<void>(resolve => { started = resolve; });
    const response = new Promise<void>(resolve => { complete = resolve; });
    server.use(http.post('http://old-controller/api/v2/rpc/connections.total', async () => {
        started();
        await response;
        return HttpResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 });
    }));
    setApiUrl('http://old-controller');
    window.location.hash = '/';
    const request = getTotalFlow();
    await received;
    setApiUrl('http://new-controller');
    complete();
    await expect(request).rejects.toMatchObject({ code: 401 });
    expect(window.location.hash).toBe('#/');
});

it('sends FakeIP pagination and exact IPv6 deletion through the generated RPC routes', async () => {
    setApiUrl('http://controller');
    const entry = { domain: 'mixed_%.example', ip: '2001:2::1' };
    server.use(
        http.post('http://controller/api/v2/rpc/resolver.fakeip.entries', async ({ request }) => {
            expect(await request.json()).toEqual({ page: 2, page_size: 25, query: 'mixed_%' });
            return HttpResponse.json({ items: [entry], page: { page: 2, pageSize: 25, total: 26 } });
        }),
        http.post('http://controller/api/v2/rpc/resolver.fakeip.entry.delete', async ({ request }) => {
            expect(await request.json()).toEqual(entry);
            return HttpResponse.json({ removed: 1 });
        }),
    );
    await expect(listFakeIPEntries(2, 25, 'mixed_%')).resolves.toMatchObject({ items: [entry], page: { total: 26 } });
    await expect(deleteFakeIPEntry(entry)).resolves.toEqual({ removed: 1 });
});
