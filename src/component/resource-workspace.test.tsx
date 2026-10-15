import { confirmAction } from '@/component/v2/confirmation';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { ResourceEditorFrame, ResourceWorkspace, useResourceSelection } from './resource-workspace';
import { useCloseGuard, useEditorDraft } from '@/hooks/use-editor-draft';

const viewport = vi.hoisted(() => ({ desktop: true }));
vi.mock('@/hooks/use-media-query', () => ({ useMediaQuery: () => viewport.desktop }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
let root: Root;
let host: HTMLDivElement;
beforeEach(() => { viewport.desktop = true; host = document.createElement('div'); document.body.append(host); root = createRoot(host); });
afterEach(() => { act(() => root.unmount()); host.remove(); vi.restoreAllMocks(); });

const records = [{ id: 'a', name: 'Alpha' }, { id: 'b', name: 'Beta' }];
function Probe({ ids = ['a', 'b'], pending = false }: { ids?: string[]; pending?: boolean }) {
    const selection = useResourceSelection(ids);
    const record = records.find(item => item.id === selection.id);
    const { value, setValue, dirty, commit } = useEditorDraft(selection.creating ? 'new' : selection.id, record, () => ({ id: '', name: '' }));
    const close = useCloseGuard(dirty, pending, selection.close);
    return <ResourceWorkspace title="Resources" selectedId={selection.id} editing={selection.creating || Boolean(selection.id)} onSelect={selection.select} onCreate={() => selection.create()}
        items={records.filter(item => ids.includes(item.id)).map(item => ({ ...item, icon: null }))}>
        <ResourceEditorFrame presentation="inline" open title={value.name} label="Editor" onClose={close} footer={<button onClick={() => commit(value)}>Save</button>}>
            <input aria-label="Name" value={value.name} onChange={event => setValue({ ...value, name: event.target.value })} />
        </ResourceEditorFrame>
    </ResourceWorkspace>;
}
async function render(props: { ids?: string[]; pending?: boolean } = {}) { await act(async () => root.render(<Probe {...props} />)); }
async function click(label: string) {
    const button = [...host.querySelectorAll('button')].find(item => item.getAttribute('aria-label') === label || item.textContent === label);
    if (!button) throw Error('Missing button ' + label);
    await act(async () => button.click());
}
function edit(name: string) {
    const input = host.querySelector('input')!;
    act(() => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, name); input.dispatchEvent(new Event('input', { bubbles: true })); });
}
it('protects drafts while switching and keeps off-page selections mounted', async () => {
    await render(); edit('Draft');
    const confirm = vi.mocked(confirmAction).mockResolvedValue(false);
    await click('Beta'); expect(host.querySelector('input')?.value).toBe('Draft');
    await click('Alpha'); expect(confirm).toHaveBeenCalledTimes(1);
    confirm.mockResolvedValue(true); await click('Beta'); expect(host.querySelector('input')?.value).toBe('Beta');
    edit('Saved beta'); await click('Save');
    await render({ ids: ['a'] }); expect(host.querySelector('input')?.value).toBe('Saved beta');
    confirm.mockClear(); await click('Alpha'); expect(confirm).not.toHaveBeenCalled();
});
it('blocks switching and creating during an operation', async () => {
    await render({ pending: true });
    await click('Beta'); expect(host.querySelector('input')?.value).toBe('Alpha');
    await click('add'); expect(host.querySelector('input')?.value).toBe('Alpha');
});
it('starts with the directory on mobile and guards the editor back button', async () => {
    viewport.desktop = false; await render(); expect(host.querySelector('input')).toBeNull();
    await click('Beta'); edit('Draft'); const confirm = vi.mocked(confirmAction).mockResolvedValue(false);
    await click('backToDirectory'); expect(host.querySelector('input')?.value).toBe('Draft');
    confirm.mockResolvedValue(true); await click('backToDirectory'); expect(host.querySelector('input')).toBeNull();
});

vi.mock('@/component/v2/confirmation', () => ({ confirmAction: vi.fn(async () => true) }));
