import { apiURL, authorizedFetch } from '@/auth/transport';

/** Render the trusted backend viewer in an opaque-origin, network-disabled frame.
 * The parent fetches its assets with headers; the frame never receives a secret. */
export async function profileDocument(path: string, signal: AbortSignal) {
    const url = apiURL(path);
    const match = /^\/debug\/profiler\/([^/]+)\//.exec(url.pathname);
    if (!match) throw new Error('Invalid profile path');
    const prefix = `/debug/profiler/${match[1]}/`;
    const response = await authorizedFetch(url, { signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const document = new DOMParser().parseFromString(await response.text(), 'text/html');
    document.querySelectorAll('base,meta[http-equiv]').forEach(node => node.remove());
    for (const element of document.querySelectorAll('script[src],link[rel="stylesheet"]')) {
        const source = new URL(element.getAttribute(element.tagName === 'SCRIPT' ? 'src' : 'href')!, url);
        if (source.origin !== url.origin || !source.pathname.startsWith(prefix)) { element.remove(); continue; }
        const asset = await authorizedFetch(source, { signal });
        if (!asset.ok) throw new Error(`HTTP ${asset.status}`);
        const inline = document.createElement(element.tagName === 'SCRIPT' ? 'script' : 'style');
        inline.textContent = await asset.text(); element.replaceWith(inline);
    }
    const base = document.createElement('base'); base.href = url.toString(); document.head.prepend(base);
    const policy = document.createElement('meta'); policy.httpEquiv = 'Content-Security-Policy';
    policy.content = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; connect-src 'none'; form-action 'none'; base-uri " + url.origin;
    document.head.prepend(policy);
    const bridge = document.createElement('script');
    bridge.textContent = `(() => {
        const send = url => { if (url.origin === ${JSON.stringify(url.origin)} && url.pathname.startsWith(${JSON.stringify(prefix)})) parent.postMessage({type:'yuhaiin:pprof-navigate', path:url.pathname, query:url.search}, '*'); };
        let current = new URL(${JSON.stringify(url.toString())});
        window.__yuhaiinProfileLocation = { get href() { return current.href; }, set href(value) { send(new URL(value, current)); }, get search() { return current.search; } };
        window.__yuhaiinProfilePushState = (_state, _title, value) => { current = new URL(value, current); };
        document.addEventListener('keydown', event => { if (event.key !== 'Enter' || event.target.id !== 'search') return; event.preventDefault(); event.stopImmediatePropagation(); const url = new URL(current); url.searchParams.set('f', event.target.value); send(url); }, true);
        document.addEventListener('click', event => { const link = event.target.closest?.('a[href]'); if (!link) return; event.preventDefault(); send(new URL(link.href)); }, true);
        document.addEventListener('submit', event => { event.preventDefault(); const form = event.target; const url = new URL(form.action || location.href, document.baseURI); for (const [key,value] of new FormData(form)) if (typeof value === 'string') url.searchParams.set(key,value); send(url); }, true);
    })();`;
    // pprof reads and updates its page URL for focus/search and flamegraph zoom.
    // srcdoc has an about: URL, so route those operations through an inert facade.
    for (const script of document.querySelectorAll('script')) {
        script.textContent = script.textContent?.replace(/window\.location\b/g, 'window.__yuhaiinProfileLocation').replace(/history\.pushState\b/g, 'window.__yuhaiinProfilePushState') ?? '';
    }
    document.head.insertBefore(bridge, base.nextSibling);
    return '<!doctype html>' + document.documentElement.outerHTML;
}
export async function downloadProfile(path: string, filename: string) {
    const response = await authorizedFetch(path);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = URL.createObjectURL(await response.blob());
    const link = document.createElement('a'); link.href = blob; link.download = filename; link.click();
    setTimeout(() => URL.revokeObjectURL(blob), 1000);
}
