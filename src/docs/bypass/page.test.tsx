import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { SWRConfig } from 'swr';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createDefaultRuleDraft, type RuleDraft } from '@/contract/route';
import { GlobalToastContext } from '@/component/v2/toast';
import BypassComponent from './page';

const api = vi.hoisted(() => ({
    listRules: vi.fn(), getRule: vi.fn(), saveRule: vi.fn(), createRule: vi.fn(), deleteRule: vi.fn(), applyRouteChanges: vi.fn(),
    listRouteLists: vi.fn(), getRouteConfig: vi.fn(), saveRouteConfig: vi.fn(), getRouteActivationStatus: vi.fn(), changeRulePriority: vi.fn(),
}));
const viewport = vi.hoisted(() => ({ desktop: true }));
vi.mock('@/api/route', () => api);
vi.mock('@/api/nodes', () => ({ listNodes: async () => ({ items: [], page: { page: 1, pageSize: 100, total: 0 } }) }));
vi.mock('@/api/selectors', () => ({ listSelectors: async () => ({ items: [] }) }));
vi.mock('@/api/inbounds', () => ({ listInbounds: async () => ({ items: [], page: { page: 1, pageSize: 100, total: 0 } }) }));
vi.mock('@/api/resolvers', () => ({ listResolvers: async () => ({ items: [], page: { page: 1, pageSize: 100, total: 0 } }) }));
vi.mock('@/hooks/use-media-query', () => ({ useMediaQuery: () => viewport.desktop }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/component/route-target-picker', () => ({ RouteTargetPicker: () => null }));
vi.mock('@/component/resolver-picker', () => ({ ResolverPicker: () => null }));
// Exercise workspace transitions with the real draft/save controller, independently of condition widgets.
vi.mock('./draft-form', () => ({ RuleDraftForm: ({ value, onChange }: { value: RuleDraft; onChange: (draft: RuleDraft) => void }) =>
    <div><output>{value.rule.name}</output><button onClick={() => onChange({ ...value, rule: { ...value.rule, name: 'Changed' } })}>Edit draft</button></div>,
}));
let host: HTMLDivElement;
let root: Root;
let drafts: RuleDraft[];
beforeEach(() => {
    vi.clearAllMocks();
    viewport.desktop = true;
    window.history.replaceState(null, '', '#/docs/bypass');
    drafts = ['First', 'Second'].map((name, index) => {
        const draft = createDefaultRuleDraft();
        draft.rule.name = name;
        draft.rule.id = String(index); draft.rule.revision = 1;
        return draft;
    });
    api.listRules.mockImplementation(async () => ({ items: drafts.map((draft, index) => ({ ...draft.rule, index: index + 1, disabled: false, resolver: '', ruleCount: 1 })), page: { page: 1, pageSize: 8, total: drafts.length } }));
    api.getRule.mockImplementation(async id => drafts.find(draft => draft.rule.id === id));
    api.saveRule.mockImplementation(async (id, draft: RuleDraft) => {
        const saved = { ...draft, rule: { ...draft.rule, revision: draft.rule.revision + 1 } };
        drafts = drafts.map(item => item.rule.id === id ? saved : item); return saved;
    });
    api.createRule.mockImplementation(async (draft: RuleDraft) => {
        const saved = { ...draft, rule: { ...draft.rule, revision: 1 } }; drafts.push(saved); return saved;
    });
    api.applyRouteChanges.mockResolvedValue(undefined);
    api.listRouteLists.mockResolvedValue({ items: [], page: { page: 1, pageSize: 100, total: 0 } });
    api.getRouteActivationStatus.mockResolvedValue({ savedRevision: 1, appliedRevision: 1 });
    api.getRouteConfig.mockResolvedValue({ revision: 1, defaultMode: 'proxy', defaultTarget: { type: 'default' } });
    host = document.createElement('div'); document.body.append(host); root = createRoot(host);
});
afterEach(() => { act(() => root.unmount()); host.remove(); vi.restoreAllMocks(); });
async function render() {
    await act(async () => root.render(<SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}><GlobalToastContext.Provider value={{ Info: vi.fn(), Error: vi.fn() }}><BypassComponent /></GlobalToastContext.Provider></SWRConfig>));
}
function button(label: string) {
    const matches = (button: HTMLButtonElement) => button.getAttribute('aria-label') === label || button.textContent === label;
    const found = Array.from(editor()?.querySelectorAll('button') ?? []).find(matches) ?? Array.from(host.querySelectorAll('button')).find(matches);
    if (!found) throw new Error(`Missing button: ${label}`);
    return found;
}
async function click(label: string) { await act(async () => button(label).click()); }
function editor() { return host.querySelector('section[aria-label="ruleEditor"]'); }

it('selects a rule inline, guards switching drafts and keeps the saved rule selected', async () => {
    await render();
    expect(editor()?.textContent).toContain('First');
    expect(host.querySelector('[role="dialog"]')).toBeNull();
    await click('Edit draft');
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    await click('Second');
    expect(editor()?.querySelector('output')?.textContent).toBe('Changed');
    expect(api.getRule).not.toHaveBeenCalledWith('1');
    confirm.mockReturnValue(true);
    await click('Second');
    expect(editor()?.querySelector('output')?.textContent).toBe('Second');
    await click('Edit draft');
    await click('saveAndApply');
    expect(api.saveRule).toHaveBeenCalledWith('1', expect.objectContaining({ rule: expect.objectContaining({ name: 'Changed' }) }));
    expect(editor()?.querySelector('output')?.textContent).toBe('Changed');
    expect(button('Changed').getAttribute('aria-current')).toBe('true');
});

it('shows the mobile directory first and protects returning from the editor', async () => {
    viewport.desktop = false;
    await render();
    expect(editor()).toBeNull();
    await click('Second');
    expect(editor()?.querySelector('output')?.textContent).toBe('Second');
    await click('Edit draft');
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    await click('backToRules'); expect(editor()).not.toBeNull();
    confirm.mockReturnValue(true);
    await click('backToRules'); expect(editor()).toBeNull();
    await click('Second'); expect(editor()?.querySelector('output')?.textContent).toBe('Second');
});

it('retries a saved new rule after failed activation without creating it twice', async () => {
    await render(); await click('add'); await click('Edit draft');
    api.applyRouteChanges.mockRejectedValueOnce(new Error('Apply failed'));
    await click('saveAndApply');
    expect(api.createRule).toHaveBeenCalledTimes(1);
    expect(editor()?.querySelector('[role="alert"]')?.textContent).toBe('Apply failed');
    await click('retryApply');
    expect(api.createRule).toHaveBeenCalledTimes(1);
    expect(api.saveRule).not.toHaveBeenCalled();
    expect(api.applyRouteChanges).toHaveBeenCalledTimes(2);
    expect(editor()?.querySelector('output')?.textContent).toBe('Changed');
});

it('retries activation after a deletion without deleting the rule twice', async () => {
    await render();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    api.deleteRule.mockImplementation(async id => { drafts = drafts.filter(draft => draft.rule.id !== id); });
    api.applyRouteChanges.mockRejectedValueOnce(new Error('Apply failed'));
    await click('deleteRule');
    expect(api.deleteRule).toHaveBeenCalledTimes(1);
    expect(editor()?.querySelector('[role="alert"]')?.textContent).toBe('Apply failed');
    await click('retryApply');
    expect(api.deleteRule).toHaveBeenCalledTimes(1);
    expect(api.saveRule).not.toHaveBeenCalled();
    expect(editor()).toBeNull();
    expect(host.textContent).toContain('selectRule');
});

it('preserves the open draft while another directory page is loading', async () => {
    let resolvePage: (value: unknown) => void;
    const nextPage = new Promise(resolve => { resolvePage = resolve; });
    api.listRules.mockImplementation(async ({ page }: { page: number }) => page === 2 ? nextPage : {
        items: drafts.map((draft, index) => ({ ...draft.rule, index: index + 1, disabled: false, resolver: '', ruleCount: 1 })),
        page: { page: 1, pageSize: 8, total: 16 },
    });
    await render(); await click('Edit draft');
    await click('pagination.next');
    expect(editor()?.querySelector('output')?.textContent).toBe('Changed');
    await act(async () => resolvePage({ items: [], page: { page: 2, pageSize: 8, total: 16 } }));
    expect(editor()?.querySelector('output')?.textContent).toBe('Changed');
    expect(api.getRule).toHaveBeenCalledTimes(1);
});
