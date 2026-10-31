import { authAPI } from '@/auth/api';

export type ChangeStore = 'identity' | 'configuration';
export interface ChangeTarget { kind: string; store: ChangeStore; writable: boolean; rollback: boolean }
export interface ConfigurationChange {
    store: ChangeStore; id: string; kind: string; resourceId: string; state: string; origin: string;
    createdBy: string; committedBy: string; createdAt: number; committedAt: number; expiresAt: number;
    revision: string; rollbackOf: string; activation: string; diff: { before: unknown; after: unknown } | null;
}
export interface StageRequest { store: ChangeStore; kind: string; resourceId?: string; action?: 'save' | 'delete'; payload: unknown }
const path = (change: Pick<ConfigurationChange, 'store' | 'id'>) => `/changes/${change.store}/${encodeURIComponent(change.id)}`;
export const changeAPI = {
    targets: (signal?: AbortSignal) => authAPI<ChangeTarget[]>('GET', '/changes/targets', undefined, signal),
    list: (signal?: AbortSignal) => authAPI<ConfigurationChange[]>('GET', '/changes', undefined, signal),
    get: (change: Pick<ConfigurationChange, 'store' | 'id'>, signal?: AbortSignal) => authAPI<ConfigurationChange>('GET', path(change), undefined, signal),
    stage: (request: StageRequest, signal?: AbortSignal) => authAPI<ConfigurationChange>('POST', '/changes', request, signal),
    validate: (change: ConfigurationChange, signal?: AbortSignal) => authAPI<{ valid: boolean }>('POST', `${path(change)}/validate`, {}, signal),
    commit: (change: ConfigurationChange, signal?: AbortSignal) => authAPI<ConfigurationChange>('POST', `${path(change)}/commit`, {}, signal),
    rollback: (change: ConfigurationChange, signal?: AbortSignal) => authAPI<ConfigurationChange>('POST', `${path(change)}/rollback`, {}, signal),
    discard: (change: ConfigurationChange, signal?: AbortSignal) => authAPI<void>('DELETE', path(change), undefined, signal),
};
