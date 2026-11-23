import { createContext, useContext } from 'react';

export const secretPlaceholder = '__yuhaiin_secret_preserved_v1__';
export const secretBytesPlaceholder = btoa(secretPlaceholder);
export function isSecretPlaceholder(value: unknown): boolean {
 if (typeof value !== 'string') return false;
 const marker = (text: string) => text === secretPlaceholder || text.startsWith(`${secretPlaceholder}.`);
 if (marker(value)) return true;
 const prefix = secretBytesPlaceholder.slice(0, Math.floor(secretPlaceholder.length / 3) * 4);
 if (value.length <= 24000 && value.startsWith(prefix)) { try { return marker(atob(value)); } catch { return false; } }
 return false;
}
export function hasSecretPlaceholder(value: unknown): boolean {
    if (isSecretPlaceholder(value)) return true;
    if (!value || typeof value !== 'object') return false;
    return Object.values(value).some(hasSecretPlaceholder);
}
export const SecretEditContext = createContext({ restricted: false, manage: true, execute: true, security: true });
export function useSecretField(value: unknown, explicitlySensitive = false) {
    const context = useContext(SecretEditContext);
    const masked = isSecretPlaceholder(value);
    return { masked, disabled: context.restricted && !context.manage && (masked || explicitlySensitive) };
}

export function useProtectedSetting(permission: "manage" | "execute" | "security") { const context = useContext(SecretEditContext); return !context.restricted || context[permission]; }

/** The server could not match a masked secret to the stored value: its
 * signed reference is tied to one Yuhaiin process and resource version, so a
 * restart or a concurrent change since loading invalidates it. */
export function isSecretReferenceConflict(error: unknown): boolean {
    if (!error || typeof error !== 'object' || !('raw' in error)) return false;
    const raw = (error as { raw?: unknown }).raw;
    if (!raw || typeof raw !== 'object' || !('error' in raw)) return false;
    return (raw as { error?: { code?: unknown } }).error?.code === 'secret_reference_conflict';
}

/** Replaces every masked secret in draft with the freshly issued reference at
 * the same path in latest, keeping all other edits. A masked value with no
 * counterpart in latest is left unchanged, so saving again still fails rather
 * than silently clearing the secret. */
export function refreshSecretReferences<T>(draft: T, latest: unknown): T {
    const walk = (value: unknown, fresh: unknown): unknown => {
        if (isSecretPlaceholder(value)) return isSecretPlaceholder(fresh) ? fresh : value;
        if (Array.isArray(value)) return value.map((item, index) => walk(item, Array.isArray(fresh) ? fresh[index] : undefined));
        if (value && typeof value === 'object') {
            const source = fresh && typeof fresh === 'object' ? fresh as Record<string, unknown> : {};
            return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, walk(item, source[key])]));
        }
        return value;
    };
    return walk(draft, latest) as T;
}
