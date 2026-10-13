import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { normalizeNode } from '@/contract/node';
import NodeImportModal from './NodeImportModal';

const api = vi.hoisted(() => ({ preview: vi.fn(), create: vi.fn(), use: vi.fn() }));
vi.mock('@/api/nodes', () => ({ previewNodeImport: api.preview, createNode: api.create, useNode: api.use }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/component/v2/forms', () => ({
    SettingInputVertical: ({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) => <input aria-label={label} value={value} onChange={event => onChange(event.target.value)} />,
    SettingSelectVertical: ({ label, value, values, onChange }: { label: string; value: string; values: [string, string][]; onChange: (value: string) => void }) => <select aria-label={label} value={value} onChange={event => onChange(event.target.value)}>{values.map(([label, value]) => <option key={value} value={value}>{label}</option>)}</select>,
}));

it('previews before creating, retains input and retries only failed nodes', async () => {
    const nodes = ['a', 'b'].map(id => normalizeNode({ id, name: id }));
    api.preview.mockResolvedValue({ items: nodes, errors: [{ line: 3, message: 'invalid link' }] });
    api.create.mockImplementation(async (node: typeof nodes[number]) => { if (node.id === 'b') throw new Error('offline'); return node; });
    const saved = vi.fn();
    const host = document.createElement('div'); document.body.append(host);
    const root = createRoot(host);
    try {
        await act(async () => root.render(<NodeImportModal show group="manual" onHide={vi.fn()} onSaved={saved} onChanged={vi.fn()} />));
        const text = document.querySelector<HTMLTextAreaElement>('textarea[aria-label="nodeLinksOrJSON"]')!;
        await act(async () => {
            Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(text, 'links');
            text.dispatchEvent(new Event('input', { bubbles: true }));
        });
        const button = (label: string) => [...document.querySelectorAll<HTMLButtonElement>('button')].find(button => button.textContent === label)!;
        await act(async () => button('previewImport').click());
        expect(api.preview).toHaveBeenCalledExactlyOnceWith('links', 'manual');
        expect(api.create).not.toHaveBeenCalled();
        expect(document.body.textContent).toContain('invalid link');
        await act(async () => button('importValidNodes').click());
        expect(api.create).toHaveBeenCalledTimes(2);
        expect(text.value).toBe('links');
        expect(saved).not.toHaveBeenCalled();
        api.create.mockResolvedValue(nodes[1]);
        await act(async () => button('retryFailedItems').click());
        expect(api.create).toHaveBeenCalledTimes(3);
        expect(api.create).toHaveBeenLastCalledWith(nodes[1]);
        expect(saved).toHaveBeenCalledOnce();
    } finally { act(() => root.unmount()); host.remove(); }
});

it('starts a fresh import when the dialog reopens after being closed', async () => {
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);
    const view = (show: boolean) => <NodeImportModal show={show} group="manual" onHide={vi.fn()} onSaved={vi.fn()} onChanged={vi.fn()} />;
    try {
        await act(async () => root.render(view(true)));
        const input = document.querySelector<HTMLTextAreaElement>('textarea[aria-label="nodeLinksOrJSON"]')!;
        await act(async () => {
            Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(input, 'old node links');
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });
        expect(input.value).toBe('old node links');
        await act(async () => root.render(view(false)));
        await act(async () => root.render(view(true)));
        const textareas = [...document.querySelectorAll<HTMLTextAreaElement>('textarea[aria-label="nodeLinksOrJSON"]')];
        const reopened = textareas[textareas.length - 1]!;
        expect(reopened.value).toBe('');
    } finally {
        act(() => root.unmount());
        host.remove();
    }
});
