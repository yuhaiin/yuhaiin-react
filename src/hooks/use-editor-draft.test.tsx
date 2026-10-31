import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { useAsyncAction, useEditorDraft } from './use-editor-draft';

const create = () => ({ name: '' });

it('protects dirty edits, accepts refreshes after saving and resets when the record changes', () => {
    function Probe({ id, data }: { id: string; data?: { name: string } }) {
        const draft = useEditorDraft(id, data, create);
        return <>
            <span>{draft.value.name}</span>
            <output data-testid="dirty">{String(draft.dirty)}</output>
            <button onClick={() => draft.setValue({ name: 'Edited' })}>edit</button>
            <button onClick={() => draft.commit({ name: 'Saved' })}>save</button>
        </>;
    }
    const host = document.createElement('div');
    const root = createRoot(host);
    try {
        act(() => root.render(<Probe id="a" data={{ name: 'A' }} />));
        act(() => host.querySelector('button')!.click());
        act(() => root.render(<Probe id="a" data={{ name: 'Refreshed' }} />));
        expect(host.querySelector('span')?.textContent).toBe('Edited');
        expect(host.querySelector('[data-testid="dirty"]')?.textContent).toBe('true');
        act(() => host.querySelectorAll('button')[1].click());
        expect(host.querySelector('[data-testid="dirty"]')?.textContent).toBe('false');
        expect(host.querySelector('span')?.textContent).toBe('Saved');
        act(() => root.render(<Probe id="a" data={{ name: 'Refreshed after save' }} />));
        expect(host.querySelector('span')?.textContent).toBe('Refreshed after save');
        act(() => host.querySelector('button')!.click());
        act(() => root.render(<Probe id="b" />));
        expect(host.querySelector('span')?.textContent).toBe('');
        expect(host.querySelector('[data-testid="dirty"]')?.textContent).toBe('false');
    } finally {
        act(() => root.unmount());
    }
});

it('rejects duplicate submission while an action is pending and unlocks after failure', async () => {
    const onError = vi.fn();
    let rejectAction: (error: unknown) => void = () => {};
    const action = vi.fn(() => new Promise<void>((_, reject) => { rejectAction = reject; }));
    const next = vi.fn(async () => undefined);
    function Probe({ execute }: { execute: () => Promise<unknown> }) {
        const { pending, run } = useAsyncAction(onError);
        return <button data-pending={pending} onClick={() => { void run(execute); }}>run</button>;
    }
    const host = document.createElement('div');
    const root = createRoot(host);
    try {
        act(() => root.render(<Probe execute={action} />));
        act(() => { host.querySelector('button')!.click(); host.querySelector('button')!.click(); });
        expect(action).toHaveBeenCalledTimes(1);
        await act(async () => rejectAction('Failed'));
        expect(onError).toHaveBeenCalledWith('Failed');
        act(() => root.render(<Probe execute={next} />));
        await act(async () => { host.querySelector('button')!.click(); });
        expect(next).toHaveBeenCalledTimes(1);
    } finally {
        act(() => root.unmount());
    }
});
