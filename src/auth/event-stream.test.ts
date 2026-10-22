import { afterEach, expect, it, vi } from 'vitest';
import { AuthenticatedEventSource, SSEParser } from './event-stream';
import { clearSession, establishSession } from './session';
import { setApiUrl } from '@/common/apiurl';
afterEach(() => { clearSession(); localStorage.clear(); vi.unstubAllGlobals(); });
it('parses fragmented CRLF, named/multiline events, and comments', () => {
    const events: string[][] = []; const parser = new SSEParser((type, data) => events.push([type, data]));
    parser.push(': heartbeat\r'); parser.push('\nevent: log\r\ndata: one\r\ndata: 二\r'); parser.push('\n\r\ndata: next\n\n');
    expect(events).toEqual([['log', 'one\n二'], ['message', 'next']]);
    expect(() => parser.push('x'.repeat(8 * 1024 * 1024 + 1))).toThrow();
});
it('authenticates streams through headers, decodes split UTF-8, and cancels on close', async () => {
    setApiUrl('https://controller.example'); establishSession('private-session', { userId: 'admin', credentialType: 'session', permissions: [] }, Math.floor(Date.now() / 1000) + 100, 'https://controller.example');
    let input!: ReadableStreamDefaultController<Uint8Array>; const cancel = vi.fn();
    const fetch = vi.fn(async (url: URL, init: RequestInit) => {
        expect(url.search).toBe(''); expect(new Headers(init.headers).get('Authorization')).toBe('Session private-session'); expect(init.credentials).toBe('include');
        const body = new ReadableStream<Uint8Array>({ start(controller) { input = controller; }, cancel });
        init.signal!.addEventListener('abort', () => { input.close(); });
        return new Response(body, { headers: { 'Content-Type': 'text/event-stream' } });
    }); vi.stubGlobal('fetch', fetch);
    const stream = new AuthenticatedEventSource('/api/v2/tools/logs/v2'); const data: string[] = [];
    const received = new Promise<void>(resolve => stream.addEventListener('log', event => { data.push(event.data); resolve(); }));
    await new Promise(resolve => setTimeout(resolve, 0));
    const encoded = new TextEncoder().encode('event: log\ndata: 二\n\n');
    input.enqueue(encoded.slice(0, 18)); input.enqueue(encoded.slice(18)); await received;
    expect(data).toEqual(['二']); stream.close(); await new Promise(resolve => setTimeout(resolve, 0)); expect(fetch.mock.calls[0][1].signal!.aborted).toBe(true);
});
