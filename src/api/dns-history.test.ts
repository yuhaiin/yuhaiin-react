import { afterAll, afterEach, beforeAll, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { setApiUrl } from '@/common/apiurl';
import { clearSession, establishSession } from '@/auth/session';
import { getApiUrl } from '@/common/apiurl';
import { clearDNSHistory, getDNSHistoryRecord, listDNSHistory, saveDNSHistorySettings } from './dns-history';

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => { server.resetHandlers(); clearSession(); localStorage.clear(); });
afterAll(() => server.close());

it('sends only the filters in use, the page and a numeric record id', async () => {
    setApiUrl('http://controller');
    server.use(
        http.post('http://controller/api/v2/rpc/dns.history.list', async ({ request }) => {
            expect(await request.json()).toEqual({ domain: 'example.com', fakeipOnly: true, from: 1000, page: 2, limit: 50 });
            return HttpResponse.json({ items: null, total: 0, limit: 50 });
        }),
        http.post('http://controller/api/v2/rpc/dns.history.get', async ({ request }) => {
            expect(await request.json()).toEqual({ id: 42 });
            return HttpResponse.json({ id: 42 });
        }),
        http.post('http://controller/api/v2/rpc/dns.history.clear', () => HttpResponse.json({ deleted: 3 })),
        http.post('http://controller/api/v2/rpc/dns.history.settings.put', async ({ request }) => HttpResponse.json(await request.json())),
    );
    await expect(listDNSHistory({ domain: ' example.com ', query: '', outcome: '', fakeipOnly: true, from: 1000 }, 2, 50)).resolves.toEqual({ items: [], total: 0, limit: 50 });
    await expect(getDNSHistoryRecord(42)).resolves.toEqual({ id: 42 });
    await expect(clearDNSHistory()).resolves.toEqual({ deleted: 3 });
    await expect(saveDNSHistorySettings({ enabled: false, retentionHours: 24, maxRecords: 1000 })).resolves.toEqual({ enabled: false, retentionHours: 24, maxRecords: 1000 });
});

it('refuses DNS history without dns-history:read before any request', async () => {
    setApiUrl('http://controller');
    establishSession('test', { userId: 'viewer', credentialType: 'session', permissions: ['connections:read', 'resolver:read'] }, Math.floor(Date.now() / 1000) + 600, getApiUrl());
    // onUnhandledFrame: 'error' fails the test if a request is sent.
    await expect(listDNSHistory({}, 1, 50)).rejects.toMatchObject({ code: 403 });
    await expect(clearDNSHistory()).rejects.toMatchObject({ code: 403 });
});
