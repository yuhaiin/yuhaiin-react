import { afterAll, afterEach, beforeAll, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { getTotalFlow } from './connections';
import { setApiUrl } from '@/common/apiurl';

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => { server.resetHandlers(); localStorage.clear(); window.location.hash = '/'; });
afterAll(() => server.close());

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
