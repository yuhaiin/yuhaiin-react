import { describe, it, expect } from 'vitest';
import {
    blankTrafficConfig,
    normalizeTrafficControl,
    toMbps,
    fromMbps,
    validateTrafficControl,
    blankProfile,
    removeTrafficProfile,
} from './traffic-control';
describe('traffic control contract', () => {
    it('uses unlimited defaults and preserves independent copies', () => {
        const x = blankTrafficConfig();
        const a = normalizeTrafficControl(x),
            b = normalizeTrafficControl(x);
        a.global.upload.bytesPerSecond = 1250000;
        expect(b.global.upload.bytesPerSecond).toBe(0);
        expect(validateTrafficControl(a)).toBeNull();
    });
    it('converts decimal Mbps and rejects invalid profiles', () => {
        expect(fromMbps(10)).toBe(1250000);
        expect(toMbps(1250000)).toBe(10);
        expect(
            validateTrafficControl({
                ...blankTrafficConfig(),
                defaultProfile: 'absent',
            }),
        ).toContain('Unknown');
        expect(
            validateTrafficControl({
                ...blankTrafficConfig(),
                global: {
                    upload: { bytesPerSecond: 0, burstBytes: 1 },
                    download: { bytesPerSecond: 0, burstBytes: 0 },
                },
            }),
        ).toContain('Unlimited');
    });
});

it('validates global limits even when a profile is named global', () => {
    const config = blankTrafficConfig();
    config.global.upload.bytesPerSecond = -1;
    config.profiles.global = blankProfile();
    expect(validateTrafficControl(config)).toContain('Invalid rate');
});
it('does not accept inherited object properties as profile references', () => {
    expect(
        validateTrafficControl({
            ...blankTrafficConfig(),
            defaultProfile: 'constructor',
        }),
    ).toContain('Unknown');
});
it('removes only references to the deleted profile without mutating the server snapshot', () => {
    const config = {
        ...blankTrafficConfig(),
        defaultProfile: 'bulk',
        profiles: { bulk: blankProfile(), work: blankProfile() },
        inboundProfiles: { a: 'bulk', b: 'work' },
        routeProfiles: { r: 'bulk' },
    };
    const next = removeTrafficProfile(config, 'bulk');
    expect(next.profiles).toEqual({ work: blankProfile() });
    expect(next.defaultProfile).toBe('');
    expect(next.inboundProfiles).toEqual({ b: 'work' });
    expect(next.routeProfiles).toEqual({});
    expect(config.defaultProfile).toBe('bulk');
    expect(config.routeProfiles).toEqual({ r: 'bulk' });
});

it('preserves small and maximum byte rates through Mbps display', () => {
    for (const bytes of [1, 63, 125, 1024, 1250000, 2 ** 40])
        expect(fromMbps(toMbps(bytes))).toBe(bytes);
});
