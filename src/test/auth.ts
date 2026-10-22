import { operationPermissions } from '@/auth/operations';
import { clearSession, establishSession } from '@/auth/session';
import { getApiUrl } from '@/common/apiurl';
/** Existing editor tests exercise an authenticated administrator's actions. */
export function authorizeTest() {
    establishSession('test-only-session', { userId: 'test-admin', credentialType: 'session', permissions: [...new Set(Object.values(operationPermissions))] }, Math.floor(Date.now() / 1000) + 600, getApiUrl());
}
export const resetTestAuth = clearSession;
