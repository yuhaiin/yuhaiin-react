import { afterEach, expect, it, vi } from 'vitest';
import { followRedirect, grantActive, landingPath, rememberReturn, takeReturn, type OAuthGrant } from './oauth-server';
import { clearSession, establishSession } from './session';
import { setApiUrl } from '@/common/apiurl';

afterEach(() => { clearSession(); sessionStorage.clear(); });
const id = 'a'.repeat(43);

it('remembers only an exact consent route across sign-in', () => {
    for (const path of ['/', '/docs/security', '//evil.example', 'https://evil.example', '/oauth/consent/short', `/oauth/consent/${id}/x`]) {
        rememberReturn(path);
        expect(takeReturn()).toBeNull();
    }
    rememberReturn(`/oauth/consent/${id}`);
    expect(takeReturn()).toBe(`/oauth/consent/${id}`);
    expect(takeReturn()).toBeNull();
    sessionStorage.setItem('yuhaiin-sign-in-return', 'javascript:alert(1)');
    expect(takeReturn()).toBeNull();
});

it('lands on the consent page after sign-in, otherwise on the usual page', () => {
    setApiUrl('https://controller.example');
    establishSession('s', { userId: 'u', credentialType: 'session', permissions: ['identity:read'] }, Math.floor(Date.now() / 1000) + 600, 'https://controller.example');
    expect(landingPath()).toBe('/docs/security');
    rememberReturn(`/oauth/consent/${id}`);
    expect(landingPath()).toBe(`/oauth/consent/${id}`);
});

it('follows only safe absolute redirects returned by the server', () => {
    const assign = vi.fn();
    followRedirect('http://127.0.0.1:8765/callback?code=x&state=y', assign);
    followRedirect('com.example.app:/oauth?code=x', assign);
    expect(assign).toHaveBeenCalledTimes(2);
    expect(() => followRedirect('javascript:alert(1)', assign)).toThrow();
    expect(() => followRedirect('/relative', assign)).toThrow();
    expect(assign).toHaveBeenCalledTimes(2);
});

it('treats revoked and expired grants as inactive', () => {
    const grant = { revoked: false, expiresAt: Math.floor(Date.now() / 1000) + 60 } as OAuthGrant;
    expect(grantActive(grant)).toBe(true);
    expect(grantActive({ ...grant, revoked: true })).toBe(false);
    expect(grantActive({ ...grant, expiresAt: 1 })).toBe(false);
});
