import { establishSession, clearSession, getSession } from '@/auth/session';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it } from 'vitest';
import useSWR from 'swr';
import { ApiCacheBoundary } from './ApiCacheBoundary';
import { getApiUrl, setApiUrl } from './apiurl';

it('isolates a late response from a previously selected controller and resets on login changes', async () => {
    localStorage.clear();
    setApiUrl('http://old-controller');
    let oldResponse: (value: string) => void;
    const oldRequest = new Promise<string>(resolve => { oldResponse = resolve; });
    function Probe() {
        const { data } = useSWR('same-resource', () => getApiUrl().includes('old-controller') ? oldRequest : Promise.resolve(getSession()?.principal.userId ?? 'new-controller'));
        return <span>{data ?? 'Loading'}</span>;
    }
    const host = document.createElement('div');
    const root = createRoot(host);
    await act(async () => root.render(<ApiCacheBoundary><Probe /></ApiCacheBoundary>));
    await act(async () => setApiUrl('http://new-controller'));
    expect(host.textContent).toBe('new-controller');
    await act(async () => oldResponse('stale-data'));
    expect(host.textContent).toBe('new-controller');
    await act(async () => {
        establishSession('test-secret', { userId: 'new-session', credentialType: 'session', permissions: [] }, Math.floor(Date.now() / 1000) + 600, getApiUrl());
    });
    expect(host.textContent).toBe('new-session');
    act(() => root.unmount());
    clearSession(); localStorage.clear();
});
