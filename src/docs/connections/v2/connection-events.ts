import { normalizeConnection, type Connection } from '@/contract/connection';

export type ConnectionEvent = { type: 'snapshot' | 'added'; connections: Connection[] } | { type: 'removed'; ids: string[] };

/** Clone the index once per render batch and retain unchanged row identities. */
export function applyConnectionEvents(previous: Record<string, Connection>, events: ConnectionEvent[]) {
    let next = { ...previous };
    for (const event of events) {
        if (event.type === 'removed') {
            for (const id of event.ids) delete next[id];
        } else {
            if (event.type === 'snapshot') next = {};
            for (const raw of event.connections) {
                const value = normalizeConnection(raw);
                const existing = next[value.id] ?? previous[value.id];
                next[value.id] = existing && JSON.stringify(existing) === JSON.stringify(value) ? existing : value;
            }
        }
    }
    const keys = Object.keys(next);
    return keys.length === Object.keys(previous).length && keys.every(key => next[key] === previous[key]) ? previous : next;
}
