import { getTrafficControl, putTrafficControl } from '@/api/traffic-control';
import {
    blankTrafficConfig,
    removeTrafficProfile,
    validateTrafficControl,
    type Profile,
    type TrafficControlConfig,
} from '@/contract/traffic-control';
import {
    useAsyncAction,
    useCloseGuard,
    useEditorDraft,
} from '@/hooks/use-editor-draft';
import { useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';

export function useTrafficControlEditor() {
    const {
        data,
        error,
        isLoading,
        mutate: refresh,
    } = useSWR('/api/v2/traffic-control', getTrafficControl, {
        revalidateOnFocus: false,
    });
    const { mutate } = useSWRConfig();
    const {
        value: draft,
        setValue: setDraft,
        commit,
        dirty,
    } = useEditorDraft('traffic-control', data, blankTrafficConfig);
    const [failure, setFailure] = useState('');
    const [saved, setSaved] = useState(false);
    const { pending: saving, run } = useAsyncAction((error) =>
        setFailure((error as { msg?: string })?.msg ?? String(error)),
    );
    useCloseGuard(dirty, saving, () => undefined);
    const patch = (
        change: (current: TrafficControlConfig) => TrafficControlConfig,
    ) => {
        setDraft(change);
        setSaved(false);
        setFailure('');
    };
    const invalid = validateTrafficControl(draft);
    const save = () =>
        run(async () => {
            if (invalid) {
                setFailure(invalid);
                return;
            }
            setFailure('');
            setSaved(false);
            const next = await putTrafficControl(draft);
            commit(next);
            void refresh(next, { revalidate: false }).catch(() => undefined);
            setSaved(true);
            // Diagnostics have their own error state and cannot invalidate a saved policy.
            void mutate('/api/v2/traffic-control/status').catch(
                () => undefined,
            );
        });
    const discard = () => {
        if (data) commit(structuredClone(data));
        setFailure('');
        setSaved(false);
    };
    const updateProfile = (name: string, profile: Profile) =>
        patch((c) => ({ ...c, profiles: { ...c.profiles, [name]: profile } }));
    const removeProfile = (name: string) =>
        patch((c) => removeTrafficProfile(c, name));
    return {
        data,
        error,
        isLoading,
        refresh,
        draft,
        dirty,
        saving,
        saved,
        failure,
        invalid,
        patch,
        save,
        discard,
        updateProfile,
        removeProfile,
    };
}
