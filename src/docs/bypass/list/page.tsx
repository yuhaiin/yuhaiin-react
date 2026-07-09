"use client"

import { Badge } from '@/component/v2/badge';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardFooter, CardHeader, CardRowList, IconBox, MainContainer, SettingLabel, SettingsBox } from '@/component/v2/card';
import { SettingInputVertical, SettingRangeVertical, SettingTypeSelect } from '@/component/v2/forms';
import { InputList } from '@/component/v2/listeditor';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from '@/component/v2/modal';
import { Spinner } from '@/component/v2/spinner';
import { GlobalToastContext } from '@/component/v2/toast';
import { ToggleGroup, ToggleItem } from '@/component/v2/togglegroup';
import { create } from "@/common/plain";
import { EmptySchema, StringValueSchema } from "@/common/plain";
import { Check, ChevronRight, CloudDownload, FileText, History, ListChecks, Network, RefreshCw, Save, SlidersHorizontal, Trash, TriangleAlert } from 'lucide-react';
import { FC, useContext, useEffect, useState } from "react";
import useSWR from "swr";
import { FetchHTTP, HttpFetcher, ApiPath, useHttpSWR, useHttpSWRRequest } from "../../../common/http";
import { mapSetting, updateIfPresent } from "../../../common/utils";
import { ConfirmModal } from "../../../component/v2/confirm";
import Loading, { Error } from "../../../component/v2/loading";
import { list_item, lists } from "@/common/api";
import { list, list_list_type_enum, list_list_type_enumSchema, list_localSchema, list_remoteSchema, listSchema, maxminddb_geoipSchema, refresh_configSchema } from "../../schema/config/bypass";

const PAGE_SIZE = 8;

const normalizeList = (value: list): list => {
    const listType = value.listType ?? value.type ?? list_list_type_enum.host;
    const errorMsgs = value.errorMsgs ?? value.error_msgs ?? [];

    if (value.list?.case) {
        const current = {
            ...value,
            listType,
            errorMsgs,
            list: { ...value.list, value: value.list.value ?? {} },
        };
        if (current.list.case === "remote") {
            current.list.value = create(list_remoteSchema, { urls: current.list.value.urls ?? [] });
        } else {
            current.list = {
                case: "local",
                value: create(list_localSchema, { lists: current.list.value.lists ?? [] }),
            };
        }
        return current;
    }

    if (value.remote) {
        return {
            ...value,
            listType,
            errorMsgs,
            list: {
                case: "remote",
                value: create(list_remoteSchema, { urls: value.remote.urls ?? [] }),
            },
        };
    }

    return {
        ...value,
        listType,
        errorMsgs,
        list: {
            case: "local",
            value: create(list_localSchema, { lists: value.local?.lists ?? [] }),
        },
    };
};

const toPlainList = (value: list): list => {
    const normalized = normalizeList(value);
    const { list: listValue, listType, errorMsgs, local, remote, type, error_msgs, ...rest } = normalized;
    return {
        ...rest,
        type: listType,
        error_msgs: errorMsgs,
        ...(listValue.case === "remote"
            ? { remote: create(list_remoteSchema, { urls: listValue.value?.urls ?? [] }) }
            : { local: create(list_localSchema, { lists: listValue.value?.lists ?? [] }) }),
    };
};

const ListItemRow: FC<{ item: list_item }> = ({ item }) => {
    return (
        <>
            <div className="grid min-w-0 flex-1 gap-3 md:grid-cols-[minmax(190px,0.36fr)_minmax(0,1fr)] md:items-center">
                <div className="flex min-w-0 items-center">
                    <FileText className="mr-4 text-gray-500 dark:text-gray-400 shrink-0" size={20} />
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <span className="truncate font-medium">{item.name}</span>
                        <Badge variant="secondary" className="shrink-0">{item.type}</Badge>
                        {item.errorCount > 0 && <Badge variant="danger" className="shrink-0">{item.errorCount} errors</Badge>}
                    </div>
                </div>
                <div className="grid min-w-0 gap-2 text-xs text-ui-muted sm:grid-cols-3">
                    <div className="min-w-0">
                        <span className="mr-1 text-ui-muted/70">Source</span>
                        <span className="font-medium text-ui-fg">{item.source || "-"}</span>
                    </div>
                    <div className="min-w-0">
                        <span className="mr-1 text-ui-muted/70">Entries</span>
                        <span className="font-medium text-ui-fg">{item.itemCount}</span>
                    </div>
                    <div className="min-w-0">
                        <span className="mr-1 text-ui-muted/70">Preview</span>
                        <span className="truncate font-mono font-medium text-ui-fg">{item.preview || "-"}</span>
                    </div>
                </div>
            </div>
            <ChevronRight className="text-gray-500 dark:text-gray-400 opacity-25 shrink-0" size={16} />
        </>
    )
}

export default function Lists() {
    const ctx = useContext(GlobalToastContext);
    const [page, setPage] = useState(1)
    const { data, error, isLoading, mutate } = useHttpSWRRequest(
        lists.method.list_page,
        { page, pageSize: PAGE_SIZE },
        { revalidateOnFocus: false }
    )
    const { data: allLists, mutate: mutateAllLists } = useHttpSWR(lists.method.list, { revalidateOnFocus: false })

    const [showdata, setShowdata] = useState({ show: false, name: "", new: false });
    const [confirm, setConfirm] = useState<{ show: boolean, name: string }>({ show: false, name: "" });
    const [refresh, setRefresh] = useState(false)
    const [saving, setSaving] = useState(false)
    const update = mapSetting(mutate)

    useEffect(() => {
        if (!data) return
        if (!data.refreshConfig) {
            update(prev => {
                return { ...prev, refreshConfig: create(refresh_configSchema, { refreshInterval: BigInt(0), }) }
            }, false)
        }
    }, [data, update])

    if (error !== undefined) return <Loading code={error.code}>{error.msg}</Loading>
    if (isLoading || data === undefined) return <Loading />

    const deleteList = (name: string) => {
        FetchHTTP(lists.method.remove, create(StringValueSchema, { value: name }),)
            .then(async ({ error }) => {
                if (error === undefined) {
                    ctx.Info("remove successful")
                    mutate()
                    mutateAllLists()
                } else {
                    ctx.Error(error.msg)
                    console.error(error.code, error.msg)
                }
            })
    }

    const handleSaveSettings = () => {
        setSaving(true)
        FetchHTTP(lists.method.save_config, {
            refreshInterval: data.refreshConfig?.refreshInterval,
            maxminddbGeoip: data.maxminddbGeoip
        })
            .then(async ({ error }) => {
                if (error === undefined) {
                    ctx.Info("save successful")
                    mutate()
                    mutateAllLists()
                } else {
                    ctx.Error(error.msg)
                    console.error(error.code, error.msg)
                }
                setSaving(false)
            })
    }

    const handleCreate = (v: string) => {
        if (allLists?.names.includes(v) || data.names.includes(v)) return;
        if (showdata.name === v && showdata.new) {
            setShowdata(prev => { return { ...prev, show: true } })
        } else {
            setShowdata({ show: true, name: v, new: true })
        }
    };

    const lastRefreshTime = data?.refreshConfig?.lastRefreshTime
        ? new Date(Number(data.refreshConfig.lastRefreshTime) * 1000).toLocaleString()
        : "Never";
    const totalLists = data.page?.total ?? data.names.length;
    const listItems: list_item[] = data.items.length > 0
        ? data.items
        : data.names.map((name) => ({ name, type: "", source: "", itemCount: 0, errorCount: 0, preview: "" }));

    return (
        <MainContainer>
            <ConfirmModal
                show={confirm.show}
                title="Delete List"
                content={<>Are you sure to delete <span className="font-bold text-red-500">{confirm.name}</span>?</>}
                onOk={() => {
                    deleteList(confirm.name)
                    setConfirm(prev => { return { ...prev, show: false } })
                }}
                onHide={() => { setConfirm(prev => { return { ...prev, show: false } }) }}
            />

            <ListsModal
                name={showdata.name}
                show={showdata.show}
                isNew={showdata.new}
                onHide={(save) => {
                    if (save) {
                        mutate();
                        mutateAllLists();
                    }
                    setShowdata(prev => { return { ...prev, show: false } })
                }}
                // Pass delete callback to Modal
                onDelete={(name) => setConfirm({ show: true, name: name })}
            />

            {/* --- 1. Page Header: Global Status Bar --- */}
            <div className="flex flex-wrap justify-between items-end mb-6 gap-4">
                <div>
                    <h4 className="font-bold mb-1">List Management</h4>
                    <div className="text-gray-500 dark:text-gray-400 flex items-center text-xs">
                        <History className="mr-2 opacity-75" />
                        <span>Last Synced: <span className="font-medium text-foreground">{lastRefreshTime}</span></span>
                    </div>
                </div>

                <Button
                    disabled={refresh}
                    onClick={() => {
                        setRefresh(true)
                        FetchHTTP(lists.method.refresh, create(EmptySchema))
                            .then(async ({ error }) => {
                                if (error === undefined) {
                                    ctx.Info("refresh successful")
                                    mutate()
                                    mutateAllLists()
                                } else {
                                    ctx.Error(error.msg)
                                    console.error(error.code, error.msg)
                                }
                                setRefresh(false)
                            })
                    }}
                >
                    {refresh ? <Spinner size="sm" /> : <RefreshCw className="mr-2" size={16} />}
                    <span>Sync All Resources</span>
                </Button>
            </div>

            <div className="flex flex-col gap-6">
                {/* --- 2. Configuration Card --- */}
                <Card>
                    <CardHeader>
                        <IconBox icon={SlidersHorizontal} color="#a855f7" title="Global Settings" description="Auto-fetch Interval & GeoIP" />
                    </CardHeader>

                    <CardBody>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Auto-fetch Interval */}
                            <div>
                                <SettingRangeVertical
                                    label="Auto-fetch Interval"
                                    value={Number(data.refreshConfig?.refreshInterval) / 60}
                                    min={0}
                                    max={24 * 30}
                                    step={1}
                                    unit="Hours"
                                    onChange={(v) => update(prev => ({
                                        ...prev,
                                        refreshConfig: updateIfPresent(prev.refreshConfig, (c) => create(refresh_configSchema, { ...c, refreshInterval: BigInt(v * 60) }))
                                    }), false)}
                                />
                            </div>

                            {/* GeoIP URL */}
                            <div className="lg:border-l lg:pl-6 border-[var(--card-inner-border)]">
                                <SettingInputVertical
                                    label="Maxmind GeoIP Database URL"
                                    placeholder="e.g. https://github.com/P3TERX/GeoLite.mmdb/raw/download/GeoLite2-Country.mmdb"
                                    value={data.maxminddbGeoip?.downloadUrl}
                                    onChange={(v) => {
                                        update(prev => ({
                                            ...prev,
                                            maxminddbGeoip: updateIfPresent(prev.maxminddbGeoip, (c) => create(maxminddb_geoipSchema, { ...c, downloadUrl: v }))
                                        }), false)
                                    }}
                                />
                                {data.maxminddbGeoip?.error && (
                                    <div className="mt-2 p-2 bg-red-500/10 text-red-500 rounded text-xs">
                                        <TriangleAlert className="mr-2" size={14} />{data.maxminddbGeoip.error}
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardBody>

                    <CardFooter className="flex justify-end">
                        <Button disabled={saving} onClick={handleSaveSettings}>
                            {saving ? <Spinner size="sm" /> : <><Save className="mr-2" size={16} />Save Configuration</>}
                        </Button>
                    </CardFooter>
                </Card>

                <CardRowList
                    layout="list"
                    paginated
                    pageSize={PAGE_SIZE}
                    currentPage={data.page?.page || page}
                    totalItems={totalLists}
                    onPageChange={setPage}
                    items={listItems}
                    getKey={(item) => item.name}
                    renderListItem={(item) => <ListItemRow item={item} />}
                    onClickItem={(item) => setShowdata({ show: true, name: item.name, new: false })}
                    onAddNew={handleCreate}
                    adding={saving}
                    header={
                        <IconBox icon={ListChecks} color="#3b82f6" title="Defined Lists" description={`${totalLists} Lists Available`} />
                    }
                />
            </div>
        </MainContainer>
    )
}

const ListsModal: FC<{ name: string, show: boolean, isNew?: boolean, onHide: (save?: boolean) => void, onDelete?: (name: string) => void }> =
    ({ name, show, isNew, onHide, onDelete }) => {
        const ctx = useContext(GlobalToastContext);
        const [loadding, setLoadding] = useState(false);

        const { data, error, isLoading, isValidating, mutate } = useSWR(name === "" ? undefined : ApiPath(lists.method.get),
            HttpFetcher(
                lists.method.get,
                create(StringValueSchema, { value: name }),
                isNew ? normalizeList(create(listSchema, {
                    name: name, type: list_list_type_enum.host, local: create(list_localSchema, { lists: [] })
                })) : undefined
            ),
            { shouldRetryOnError: false, keepPreviousData: false, revalidateOnFocus: false })

        useEffect(() => { mutate(); }, [name, isNew, mutate])

        const handleSave = () => {
            if (!data) return;
            setLoadding(true)
            FetchHTTP(lists.method.save, toPlainList(data))
                .then(async ({ error }) => {
                    if (error === undefined) {
                        ctx.Info("save successful")
                        onHide(true)
                    } else {
                        ctx.Error(error.msg)
                        console.error(error.code, error.msg)
                    }
                    mutate();
                    setLoadding(false)
                })
        }

        return (
            <Modal open={show} onOpenChange={(open) => !open && onHide()}>
                <ModalContent style={{ maxWidth: '800px' }}>
                    <ModalHeader closeButton>
                        <ModalTitle>{name}</ModalTitle>
                    </ModalHeader>
                    <ModalBody>
                        {error ?
                            <Error statusCode={error.code} title={error.msg} /> :
                            isValidating || isLoading || !data ? <Loading /> :
                                <Single value={normalizeList(data)} onChange={(e) => { mutate(normalizeList(e), false) }} />
                        }
                    </ModalBody>
                    <ModalFooter className="flex justify-between">
                        <div>
                            {!isNew && name !== "bootstrap" && onDelete && (
                                <Button
                                    variant="outline-danger"
                                    onClick={() => { onHide(false); onDelete(name); }}
                                >
                                    <Trash className="mr-2" size={16} />Delete List
                                </Button>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={() => onHide()}>Cancel</Button>
                            <Button
                                disabled={loadding}
                                onClick={handleSave}
                            >
                                {loadding ? <Spinner size="sm" /> : <><Check className="mr-2" size={16} />Save</>}
                            </Button>
                        </div>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        )
    }

const Single: FC<{ value: list, onChange: (x: list) => void }> = ({ value, onChange }) => {
    const current = normalizeList(value);

    const isRemote = current.list.case === "remote";

    const handleModeChange = (remote: boolean) => {
        if (remote === isRemote) return;
        const currentData = current.list.case === "remote" ? current.list.value.urls ?? [] : current.list.value?.lists ?? [];

        onChange({
            ...current,
            list: remote ?
                { case: "remote", value: create(list_remoteSchema, { urls: currentData }) } :
                { case: "local", value: create(list_localSchema, { lists: currentData }) }
        });
    };

    return (
        <div className="flex flex-col gap-6">
            {/* 1. Top Settings Area */}
            <SettingsBox>
                <div className="grid grid-cols-1 gap-6">
                    {/* Content Type */}
                    <div>
                        <SettingTypeSelect
                            label='Content Type'
                            type={list_list_type_enumSchema}
                            value={current.listType}
                            onChange={(v) => onChange({ ...current, listType: v })}
                        />
                    </div>

                    {/* Source Mode */}
                    <div>
                        <SettingLabel className="mb-2">Source Mode</SettingLabel>
                        <ToggleGroup
                            type="single"
                            value={isRemote ? "remote" : "local"}
                            onValueChange={(v) => v && handleModeChange(v === "remote")}
                            className="w-full flex-nowrap"
                        >
                            <ToggleItem value="local" className="flex-grow whitespace-nowrap">
                                <Network className="mr-2" />Local
                            </ToggleItem>
                            <ToggleItem value="remote" className="flex-grow whitespace-nowrap">
                                <CloudDownload className="mr-2" />Remote
                            </ToggleItem>
                        </ToggleGroup>
                    </div>
                </div>
            </SettingsBox>

            {/* 2. List Editor Area */}
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-end px-1">
                    <div>
                        <h6 className="font-bold mb-1">
                            {isRemote ? "Remote Resource URLs" : "Local Rules"}
                        </h6>
                        <small className="text-gray-500 dark:text-gray-400 opacity-75">
                            {isRemote
                                ? "Files will be downloaded and updated automatically."
                                : "Define rules manually (Domain, IP CIDR, etc)."}
                        </small>
                    </div>
                    <Badge variant="secondary" pill>
                        {(current.list.case === "remote" ? current.list.value.urls ?? [] : current.list.value?.lists ?? []).length} Entries
                    </Badge>
                </div>

                <div className="bg-secondary/10 p-4 rounded-md border border-gray-500/10">
                    <InputList
                        title={isRemote ? "URL" : "Rule"}
                        dump
                        data={current.list.case === "remote" ? current.list.value.urls ?? [] : current.list.value?.lists ?? []}
                        onChange={(x) => {
                            onChange({
                                ...current,
                                list: isRemote ?
                                    { case: "remote", value: create(list_remoteSchema, { urls: x }) } :
                                    { case: "local", value: create(list_localSchema, { lists: x }) }
                            })
                        }}
                    />
                </div>
            </div>

            {/* 3. Error Messages Area */}
            {current.errorMsgs && current.errorMsgs.length > 0 && (
                <div className="mt-2">
                    <SettingLabel className="text-red-500 mb-2">Error Messages</SettingLabel>
                    <div className="p-4 bg-red-500/10 text-red-500 rounded-md text-xs font-mono">
                        {current.errorMsgs.map((msg, i) => <div key={i} className="mb-1">• {msg}</div>)}
                    </div>
                </div>
            )}
        </div>
    );
}
