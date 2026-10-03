import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { useAsyncAction, useEditorDraft } from './use-editor-draft';

const create = () => ({ name: '' });
it('retains edits during refresh and clears drafts when the selected record changes', () => {
    let draft: ReturnType<typeof useEditorDraft<{ name: string }>>;
    function Probe({ id, data }: { id: string; data?: { name: string } }) {
        draft = useEditorDraft(id, data, create);
        return <span>{draft.value.name}</span>;
    }
    const host = document.createElement('div');
    const root = createRoot(host);
    act(() => root.render(<Probe id="a" data={{ name: 'A' }} />));
    act(() => draft.setValue({ name: 'Edited' }));
    act(() => root.render(<Probe id="a" data={{ name: 'Refreshed' }} />));
    expect(host.textContent).toBe('Edited');
    expect(draft!.dirty).toBe(true);
    act(() => root.render(<Probe id="b" />));
    expect(host.textContent).toBe('');
    expect(draft!.dirty).toBe(false);
    act(() => root.unmount());
});

it('rejects duplicate submission while an action is pending and unlocks after failure', async () => {
    let actions: ReturnType<typeof useAsyncAction>;
    const onError = vi.fn();
    function Probe() { actions = useAsyncAction(onError); return null; }
    const root = createRoot(document.createElement('div'));
    act(() => root.render(<Probe />));
    let reject: (error: unknown) => void;
    const action = vi.fn(() => new Promise((_, rejectPromise) => { reject = rejectPromise; }));
    act(() => { void actions.run(action); void actions.run(action); });
    expect(action).toHaveBeenCalledTimes(1);
    await act(async () => reject('Failed'));
    expect(onError).toHaveBeenCalledWith('Failed');
    const next = vi.fn(async () => undefined);
    await act(async () => { await actions.run(next); });
    expect(next).toHaveBeenCalledTimes(1);
    act(() => root.unmount());
});

it('treats a saved draft as pristine and accepts the next server refresh', () => {
    let draft: ReturnType<typeof useEditorDraft<{ name: string }>>;
    function Probe({ data }: { data: { name: string } }) {
        draft = useEditorDraft('a', data, create);
        return <span>{draft.value.name}</span>;
    }
    const host = document.createElement('div');
    const root = createRoot(host);
    const server = { name: 'Original' };
    act(() => root.render(<Probe data={server} />));
    act(() => draft.setValue({ name: 'Edited' }));
    act(() => draft.commit({ name: 'Saved' }));
    expect(draft!.dirty).toBe(false);
    expect(host.textContent).toBe('Saved');
    act(() => root.render(<Probe data={{ name: 'Refreshed' }} />));
    expect(host.textContent).toBe('Refreshed');
    act(() => root.unmount());
});
