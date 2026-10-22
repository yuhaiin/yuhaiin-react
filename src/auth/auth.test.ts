/// <reference types="node" />
import { pbkdf2Sync, webcrypto } from 'node:crypto';
import { afterEach, expect, it, vi } from 'vitest';
import { deriveCredential, login, enroll, initialize, initializationStatus, type PasswordParameters } from './api';
import { authorizedFetch } from './transport';
import { authHeaders, authScope, clearSession, establishSession, establishLocalConnection, getSession, can } from './session';
import { getApiUrl, setApiUrl } from '@/common/apiurl';
const parameters: PasswordParameters = { algorithm: 'pbkdf2-sha256-v1', salt: 'AAECAwQFBgcICQoLDA0ODw', iterations: 600000, digest: 'SHA-256', bytes: 32, normalization: 'NFC', encoding: 'utf-8/base64url-unpadded' };
const principal = { userId: 'reader', credentialType: 'session', permissions: ['identity:read', 'nodes:read'] };
afterEach(() => { clearSession(); localStorage.clear(); vi.unstubAllGlobals(); vi.useRealTimers(); });
it('connects to an explicitly local controller without creating credentials or granting account-management permissions', async () => {
    vi.useFakeTimers(); setApiUrl('http://127.0.0.1:50051');
    const fetch = vi.fn(async (url: URL, init: RequestInit) => {
        expect(url.pathname).toBe('/api/v2/management'); expect(new Headers(init.headers).has('Authorization')).toBe(false);
        return Response.json({ authentication: 'none' });
    }); vi.stubGlobal('fetch', fetch);
    expect(await initializationStatus(getApiUrl(), new AbortController().signal)).toEqual({ authentication: 'none', required: false, expiresAt: 0 });
    establishLocalConnection(getApiUrl());
    expect(authHeaders()).toEqual({}); expect(getSession()?.principal.credentialType).toBe('local');
    expect(can('settings:write')).toBe(true); expect(can('users:manage')).toBe(false); expect(can('identity:read')).toBe(false);
    await vi.advanceTimersByTimeAsync(8 * 3600 * 1000); expect(getSession()).not.toBeNull();
    expect(fetch).toHaveBeenCalledTimes(1);
    setApiUrl('https://remote.example'); expect(getSession()).toBeNull();
    expect(() => establishLocalConnection(getApiUrl())).toThrow('loopback');
    await expect(initializationStatus(getApiUrl(), new AbortController().signal)).rejects.toThrow('loopback');
});
it('does not interpret missing or unknown management capabilities as anonymous access', async () => {
    setApiUrl('http://127.0.0.1:50051');
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 404 })));
    await expect(initializationStatus(getApiUrl(), new AbortController().signal)).rejects.toEqual({ code: 404 });
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ authentication: 'unknown' })));
    await expect(initializationStatus(getApiUrl(), new AbortController().signal)).rejects.toThrow('Unsupported');
    expect(getSession()).toBeNull();
});
it('checks a draft controller without credentials and initializes with only a derived credential', async () => {
    vi.stubGlobal('crypto', webcrypto); setApiUrl('https://controller.example');
    const password = 'new administrator password';
    const fetch = vi.fn(async (url: URL, init: RequestInit) => {
        expect(init.credentials).toBe('omit'); expect(init.redirect).toBe('error');
        expect(String(init.body)).not.toContain(password);
        if (url.hostname === 'draft.example') {
            if (url.pathname === '/api/v2/management') return Response.json({ authentication: 'local-users' });
            expect(new Headers(init.headers).has('Authorization')).toBe(false);
            return Response.json({ required: true, expiresAt: 12345 });
        }
        expect(new Headers(init.headers).get('Authorization')).toBe('Setup startup-code');
        if (url.pathname.endsWith('/parameters')) return Response.json(parameters);
        const body = JSON.parse(String(init.body));
        expect(body).toEqual({ login: 'owner', clientCredential: expect.stringMatching(/^[A-Za-z0-9_-]{43}$/) });
        return Response.json({});
    }); vi.stubGlobal('fetch', fetch);
    const status = await initializationStatus('https://draft.example', new AbortController().signal);
    expect(status.required).toBe(true); expect(getApiUrl()).toBe('https://controller.example');
    await initialize('startup-code', 'owner', password);
    expect(fetch).toHaveBeenCalledTimes(4);
    expect(getSession()).toBeNull();
});
it('matches the Go PBKDF2 contract and normalizes Unicode without trimming', async () => {
    vi.stubGlobal('crypto', webcrypto);
    for (const password of ['密码-é-🦊', '密码-e\u0301-🦊', ' do not trim ']) {
        const expected = pbkdf2Sync(password.normalize('NFC'), Buffer.from(parameters.salt, 'base64url'), 600000, 32, 'sha256').toString('base64url');
        expect(await deriveCredential(password, parameters)).toBe(expected);
    }
    await expect(deriveCredential('\ud800', parameters)).rejects.toThrow('Unicode');
    await expect(deriveCredential('password', { ...parameters, iterations: 1 })).rejects.toThrow('parameters');
    await expect(deriveCredential('', parameters)).rejects.toThrow();
});
it('sends only derived credentials for enrollment and login and keeps sessions out of storage and scope keys', async () => {
    vi.stubGlobal('crypto', webcrypto); setApiUrl('https://controller.example');
    const password = 'not transmitted 密码'; const bodies: string[] = [];
    const fetch = vi.fn(async (url: URL, init: RequestInit) => {
        bodies.push(String(init.body ?? ''));
        expect(url.search).toBe(''); expect(init.credentials).toBe('omit'); expect(init.redirect).toBe('error');
        const path = url.pathname;
        if (path.endsWith('/parameters')) return Response.json(parameters);
        if (path.endsWith('/enrollment')) { expect(new Headers(init.headers).get('Authorization')).toBe('Enrollment once-only-capability'); return Response.json({}); }
        if (path.endsWith('/login')) return Response.json({ secret: 'session-secret', expiresAt: Math.floor(Date.now() / 1000) + 100 });
        expect(new Headers(init.headers).get('Authorization')).toBe('Session session-secret'); return Response.json(principal);
    }); vi.stubGlobal('fetch', fetch);
    await enroll('once-only-capability', password); await login('reader', password);
    expect(bodies.join('')).not.toContain(password);
    expect(bodies.filter(body => body.includes('clientCredential'))).toHaveLength(2);
    expect(authHeaders()).toEqual({ Authorization: 'Session session-secret' });
    expect(authScope()).not.toContain('session-secret');
    for (let index = 0; index < localStorage.length; index++) expect(localStorage.getItem(localStorage.key(index)!)).not.toContain('secret');
});
it('invalidates on controller changes, expiry, and unauthorized responses, without stale-response logout', async () => {
    vi.useFakeTimers(); setApiUrl('https://old.example');
    establishSession('old-secret', principal, Math.floor(Date.now() / 1000) + 100, getApiUrl());
    let finish!: (response: Response) => void;
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(resolve => { finish = resolve; })));
    const old = authorizedFetch('/api/v2/auth/me');
    setApiUrl('https://new.example'); expect(getSession()).toBeNull();
    establishSession('new-secret', principal, Math.floor(Date.now() / 1000) + 10, getApiUrl());
    finish(new Response('', { status: 401 })); await old;
    expect(authHeaders().Authorization).toBe('Session new-secret');
    await vi.advanceTimersByTimeAsync(10000); expect(getSession()).toBeNull();
    establishSession('newer-secret', principal, Math.floor(Date.now() / 1000) + 10, getApiUrl());
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 401 })));
    await authorizedFetch('/api/v2/auth/me'); expect(getSession()).toBeNull();
});
it('never sends credentials to remote HTTP, foreign origins, or token query URLs', async () => {
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch); setApiUrl('http://remote.example');
    establishSession('private', principal, Math.floor(Date.now() / 1000) + 100, getApiUrl());
    await expect(authorizedFetch('/api/v2/auth/me')).rejects.toThrow('HTTPS');
    await expect(authorizedFetch(new URL('https://other.example/api/v2/auth/me'))).rejects.toThrow('endpoint');
    await expect(authorizedFetch('/api/v2/auth/me?token=private')).rejects.toThrow('endpoint');
    expect(fetch).not.toHaveBeenCalled();
});
