import { afterEach, expect, it, vi } from 'vitest';
import { profileDocument } from './authenticated-view';
import { clearSession, establishSession } from '@/auth/session';
import { setApiUrl } from '@/common/apiurl';
afterEach(() => { clearSession(); localStorage.clear(); vi.unstubAllGlobals(); });
it('fetches viewer assets with auth and emits an isolated document without exposing credentials', async () => {
    setApiUrl('https://controller.example'); establishSession('never-in-html', { userId: 'admin', credentialType: 'session', permissions: ['diagnostics:run'] }, Math.floor(Date.now() / 1000) + 100, 'https://controller.example');
    const fetch = vi.fn(async (url: URL, init: RequestInit) => {
        expect(new Headers(init.headers).get('Authorization')).toBe('Session never-in-html');
        if (url.pathname.endsWith('/top')) return new Response('<html><head><script src="static/viewer.js"></script><link rel="stylesheet" href="static/viewer.css"><script src="https://other.example/spy.js"></script></head><body><a href="graph?f=foo">Graph</a></body></html>');
        return new Response(url.pathname.endsWith('.js') ? 'window.ready = true;' : 'body { color: black; }');
    }); vi.stubGlobal('fetch', fetch);
    const html = await profileDocument('/debug/profiler/id/top', new AbortController().signal);
    expect(fetch).toHaveBeenCalledTimes(3); expect(html).toContain('connect-src'); expect(html).not.toContain('never-in-html'); expect(html).not.toContain('spy.js'); expect(html).toContain('window.ready = true'); expect(html).toContain('yuhaiin:pprof-navigate');
});
it('preserves pprof URL state and sends focus navigation to the parent without navigating srcdoc', async () => {
    setApiUrl('https://controller.example');
    vi.stubGlobal('fetch', vi.fn(async () => new Response('<html><head><script>window.initial = window.location.href; history.pushState(null, "", "?f=zoom"); window.updated = window.location.search; window.location.href = "?f=focus";</script></head><body></body></html>')));
    const html = await profileDocument('/debug/profiler/id/top?si=1', new AbortController().signal);
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const frame: { initial?: string; updated?: string } = {};
    const parent = { postMessage: vi.fn() };
    for (const script of doc.querySelectorAll('script')) new Function('window', 'parent', 'document', script.textContent!)(frame, parent, doc);
    expect(frame.initial).toBe('https://controller.example/debug/profiler/id/top?si=1');
    expect(frame.updated).toBe('?f=zoom');
    expect(parent.postMessage).toHaveBeenCalledWith({ type: 'yuhaiin:pprof-navigate', path: '/debug/profiler/id/top', query: '?f=focus' }, '*');
    const search = doc.createElement('input'); search.id = 'search'; search.value = 'selected'; doc.body.append(search);
    search.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    expect(parent.postMessage).toHaveBeenLastCalledWith({ type: 'yuhaiin:pprof-navigate', path: '/debug/profiler/id/top', query: '?f=selected' }, '*');
});
