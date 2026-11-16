import { useAsyncAction, useCloseGuard, useEditorDraft } from '@/hooks/use-editor-draft';
import { useTranslation } from 'react-i18next';
import { getFakeDNS, saveFakeDNS } from '@/api/resolvers';
import { collectPages } from '@/api/paging';
import { listRouteLists } from '@/api/route';
import { usePermission } from '@/auth/context';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardFooter, CardHeader, IconBox } from '@/component/v2/card';
import { SettingInputVertical } from '@/component/v2/forms';
import { InputList } from '@/component/v2/listeditor';
import { MultiSelectChips } from '@/component/v2/multi-select';
import { Spinner } from '@/component/v2/spinner';
import Switch from '@/component/v2/switch';
import { GlobalToastContext } from '@/component/v2/toast';
import { FakeDNS, normalizeFakeDNS } from '@/contract/resolver';
import type { ListItem } from '@/contract/route';
import { RotateCw, Save, Wand2 } from 'lucide-react';
import { FC, useContext } from "react";
import useSWR from "swr";
import Loading from "../../../component/v2/loading";

const HOST_LIST_TYPES = ['host', 'hosts_as_host'];

/** Picks shared host lists whose domains are matched in addition to the inline entries. */
const SharedListPicker: FC<{
    label: string;
    lists: ListItem[] | undefined;
    allowed: boolean;
    value: string[];
    onChange: (value: string[]) => void;
}> = ({ label, lists, allowed, value, onChange }) => {
    const { t: uiT } = useTranslation('ui');
    const names = new Map((lists ?? []).map(list => [list.id, list.name]));
    const options = [
        ...(lists ?? []).map(list => ({ value: list.id, label: list.name })),
        // A reference saved before the list became unreadable stays removable.
        ...value.filter(id => !names.has(id)).map(id => ({ value: id, label: uiT('fakednsMissingList', { id }) })),
    ];
    return <fieldset className="space-y-2" disabled={!allowed}>
        <legend className="text-sm font-medium text-ui-muted">{label} · {uiT('fakednsSharedLists')}</legend>
        {!allowed
            ? <p className="text-xs text-ui-muted">{uiT('fakednsSharedListsNoPermission')}</p>
            : options.length === 0
                ? <div className="text-xs text-ui-muted">{lists === undefined ? <Spinner size="sm" /> : uiT("fakednsNoSharedLists")}</div>
                : <MultiSelectChips options={options} value={value} onChange={onChange} />}
        {allowed && <p className="text-xs text-ui-muted">{uiT('fakednsSharedListsHint')}</p>}
    </fieldset>;
};

export const Fakedns: FC = () => {
    const { t: uiT } = useTranslation('ui');

    const ctx = useContext(GlobalToastContext);

    const { data: server, error, isLoading, mutate } = useSWR("/api/v2/resolver/fakedns", getFakeDNS, { revalidateOnFocus: false });
    const { value: data, setValue, dirty: isDirty, commit } = useEditorDraft("fakedns", server, () => undefined);
    const { pending: saving, run } = useAsyncAction(error => ctx.Error(String((error as { msg?: string })?.msg ?? error)));
    useCloseGuard(isDirty, saving, () => undefined);

    const canReadLists = usePermission('routes:read');
    const { data: sharedLists } = useSWR(
        canReadLists ? "/api/v2/route/lists/options" : null,
        () => collectPages(listRouteLists),
        { revalidateOnFocus: false },
    );
    const hostLists = sharedLists?.items.filter(list => !list.ownerRuleId && HOST_LIST_TYPES.includes(list.type));

    if (error !== undefined) return <Loading code={error.code} onRetry={() => void mutate()}>{error.msg}</Loading>
    if (isLoading || data === undefined) return <Loading />

    const handleSave = () => {
        if (!data || saving) return;
        void run(async () => {
            const next = await saveFakeDNS(data);
            commit(next);
            await mutate(next, { revalidate: false });
            ctx.Info(uiT("save"));
        });
    };
    const handleMutate = (mutator: (prev: FakeDNS) => FakeDNS) => {
        setValue(prev => prev ? mutator(normalizeFakeDNS(prev)) : prev);
    };

    return (
        <Card className="h-full flex flex-col">
            <fieldset disabled={saving} className="contents">
            <CardHeader className="flex justify-between items-center">
                <IconBox icon={Wand2} tone="success" title={uiT("fakedns")} description={uiT("virtualIpStrategy")} />
                <div className="flex items-center gap-2">
                    <span className="text-xs text-ui-muted font-medium">{data.enabled ? "ACTIVE" : "DISABLED"}</span>
                    <Switch aria-label={uiT("fakedns")}
                        checked={data.enabled}
                        onCheckedChange={(checked) => handleMutate(prev => ({ ...prev, enabled: checked }))}
                    />
                </div>
            </CardHeader>
            <CardBody className="flex-grow">
                <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <SettingInputVertical
                                label={uiT("ipv4Range")}
                                value={data.ipv4Range}
                                onChange={(v: string) => handleMutate(prev => ({ ...prev, ipv4Range: v }))}
                            />
                        </div>
                        <div>
                            <SettingInputVertical
                                label={uiT("ipv6Range")}
                                value={data.ipv6Range}
                                onChange={(v: string) => handleMutate(prev => ({ ...prev, ipv6Range: v }))}
                            />
                        </div>
                    </div>

                    <hr className="my-0 border-ui-border/70" />

                    <InputList
                        title={uiT("domainWhitelist")}
                        data={data.whitelist}
                        onChange={(v) => handleMutate(prev => ({ ...prev, whitelist: v }))}
                    />
                    <SharedListPicker
                        label={uiT("domainWhitelist")}
                        lists={hostLists}
                        allowed={canReadLists}
                        value={data.whitelistListIds ?? []}
                        onChange={(v) => handleMutate(prev => ({ ...prev, whitelistListIds: v }))}
                    />

                    <hr className="my-0 border-ui-border/70" />

                    <InputList
                        title={uiT("skipCheckList")}
                        data={data.skipCheckList ? data.skipCheckList : []}
                        onChange={(v) => handleMutate(prev => ({ ...prev, skipCheckList: v }))}
                    />
                    <SharedListPicker
                        label={uiT("skipCheckList")}
                        lists={hostLists}
                        allowed={canReadLists}
                        value={data.skipCheckListIds ?? []}
                        onChange={(v) => handleMutate(prev => ({ ...prev, skipCheckListIds: v }))}
                    />
                </div>
            </CardBody>

            <CardFooter className="flex justify-end gap-2">
                <Button
                    size="sm"
                    disabled={saving || !isDirty}
                    onClick={() => server && commit(server)}
                >
                    <RotateCw className="mr-2" size={16} />{uiT("reset")}</Button>
                <Button permission="resolver:write"
                    size="sm"
                    disabled={saving || !isDirty}
                    onClick={handleSave}
                >
                    {saving ? <Spinner size="sm" /> : <><Save className="mr-2" size={16} />{uiT("save")}</>}
                </Button>
            </CardFooter>
            </fieldset>
        </Card>
    );
}
