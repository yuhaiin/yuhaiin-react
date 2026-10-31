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
