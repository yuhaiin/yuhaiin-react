import { authorizedFetch } from './transport';

/** Fetch-based SSE: credentials stay in headers and cancellation closes the reader. */
export class AuthenticatedEventSource {
    onopen: (() => void) | null = null;
    onerror: (() => void) | null = null;
    private controller = new AbortController();
    private listeners = new Map<string, Array<(event: MessageEvent<string>) => void>>();
    constructor(path: string) { void this.read(path); }
    addEventListener(type: string, listener: (event: MessageEvent<string>) => void) {
        const group = this.listeners.get(type) ?? []; group.push(listener); this.listeners.set(type, group);
    }
    close() { this.controller.abort(); this.listeners.clear(); }
    private async read(path: string) {
        try {
            const response = await authorizedFetch(path, { signal: this.controller.signal, headers: { Accept: 'text/event-stream' } });
            if (!response.ok || !response.body || !response.headers.get('Content-Type')?.includes('text/event-stream')) throw new Error('Stream unavailable');
            if (this.controller.signal.aborted) { await response.body.cancel(); return; }
            this.onopen?.();
            const parser = new SSEParser((type, data) => {
                if (!this.controller.signal.aborted) this.listeners.get(type)?.forEach(listener => listener(new MessageEvent(type, { data })));
            });
            const reader = response.body.getReader(); const decoder = new TextDecoder();
            try {
                while (!this.controller.signal.aborted) {
                    const { done, value } = await reader.read(); if (done) break;
                    parser.push(decoder.decode(value, { stream: true }));
                }
            } finally { await reader.cancel().catch(() => undefined); reader.releaseLock(); }
            if (!this.controller.signal.aborted) this.onerror?.();
        } catch { if (!this.controller.signal.aborted) this.onerror?.(); }
    }
}
export class SSEParser {
    private buffer = ''; private data: string[] = []; private type = 'message'; private size = 0;
    constructor(private emit: (type: string, data: string) => void) {}
    push(chunk: string) {
        this.buffer += chunk;
        if (this.buffer.length + this.size > 8 * 1024 * 1024) throw new Error('Stream event too large');
        while (true) {
            const match = /\r\n|\r|\n/.exec(this.buffer);
            if (!match || (match[0] === '\r' && match.index === this.buffer.length - 1)) return;
            const line = this.buffer.slice(0, match.index); this.buffer = this.buffer.slice(match.index + match[0].length);
            if (!line) {
                if (this.data.length) this.emit(this.type, this.data.join('\n'));
                this.type = 'message'; this.data = []; this.size = 0; continue;
            }
            const colon = line.indexOf(':'); const field = colon < 0 ? line : line.slice(0, colon);
            const value = colon < 0 ? '' : line.slice(colon + 1).replace(/^ /, '');
            if (field === 'event') this.type = value;
            if (field === 'data') { this.data.push(value); this.size += value.length; }
        }
    }
}
