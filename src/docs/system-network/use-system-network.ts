import { getSystemNetworkConfig, getSystemNetworkInterfaces, getSystemNetworkStatus, previewSystemNetwork, putSystemNetworkConfig, systemNetworkKeys } from '@/api/system-network';
import { blankSystemNetworkConfig, configHasErrors, type SystemNetworkConfig } from '@/contract/system-network';
import { useAsyncAction, useCloseGuard, useEditorDraft } from '@/hooks/use-editor-draft';
import { useState } from 'react';
import useSWR from 'swr';
import { useDebounceValue } from 'usehooks-ts';

/**
 * The saved configuration is edited as one draft and applied with one save.
 * Runtime status is polled separately, so the page always shows what the
 * operating system actually uses, also after a save whose apply failed.
 */
export function useSystemNetwork() {
    const config = useSWR(systemNetworkKeys.config, getSystemNetworkConfig, { revalidateOnFocus: false });
    const status = useSWR(systemNetworkKeys.status, getSystemNetworkStatus, { refreshInterval: 5000 });
    const interfaces = useSWR(systemNetworkKeys.interfaces, getSystemNetworkInterfaces, { refreshInterval: 10000 });
    const { value: draft, setValue, commit, dirty } = useEditorDraft('system-network', config.data, blankSystemNetworkConfig);
    const [failure, setFailure] = useState('');
    const [saved, setSaved] = useState<'ok' | 'problems' | ''>('');
    const { pending: saving, run } = useAsyncAction(error => setFailure((error as { msg?: string })?.msg ?? String(error)));
    useCloseGuard(dirty, saving, () => undefined);
    const invalid = configHasErrors(draft);
    const patch = (change: (current: SystemNetworkConfig) => SystemNetworkConfig) => {
        setValue(change);
        setSaved('');
        setFailure('');
    };
    const save = () => run(async () => {
        if (invalid) return;
        setFailure('');
        const result = await putSystemNetworkConfig(draft);
        commit(result.config);
        void config.mutate(result.config, { revalidate: false }).catch(() => undefined);
        void status.mutate(result.status, { revalidate: false }).catch(() => undefined);
        void interfaces.mutate().catch(() => undefined);
        const problems = result.status.state !== 'active' || result.status.rules.some(rule => !['active', 'disabled'].includes(rule.state));
        setSaved(problems ? 'problems' : 'ok');
    });
    const discard = () => {
        if (config.data) commit(structuredClone(config.data));
        setFailure('');
        setSaved('');
    };
    // The preview shows route counts and shadowing for the draft as typed.
    const [debounced] = useDebounceValue(draft, 400);
    const preview = useSWR(invalid ? null : ['system-network-preview', JSON.stringify(debounced.routes)],
        () => previewSystemNetwork({ ...debounced, forwarding: { ipv4: false, ipv6: false, rules: [] } }), { revalidateOnFocus: false, keepPreviousData: true });
    return { config, status, interfaces, preview: preview.data, draft, dirty, saving, saved, failure, invalid, patch, save, discard };
}
