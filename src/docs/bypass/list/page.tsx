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
import { create } from "@bufbuild/protobuf";
import { EmptySchema, StringValueSchema } from "@bufbuild/protobuf/wkt";
import { Check, ChevronRight, CloudDownload, FileText, History, ListChecks, Network, RefreshCw, Save, SlidersHorizontal, Trash, TriangleAlert } from 'lucide-react';
import { FC, useContext, useEffect, useState } from "react";
import useSWR from "swr";
import { FetchProtobuf, ProtoESFetcher, ProtoPath, useProtoSWR } from "../../../common/proto";
import { mapSetting, updateIfPresent } from "../../../common/utils";
import { ConfirmModal } from "../../../component/v2/confirm";
import Loading, { Error } from "../../../component/v2/loading";
import { lists, save_list_config_requestSchema } from "../../pbes/api/config_pb";
import { list, list_list_type_enum, list_list_type_enumSchema, list_localSchema, list_remoteSchema, listSchema, maxminddb_geoipSchema, refresh_configSchema } from "../../pbes/config/bypass_pb";


export default function Lists() {
    const ctx = useContext(GlobalToastContext);
    const { data, error, isLoading, mutate } = useProtoSWR(lists.method.list, { revalidateOnFocus: false })

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
        FetchProtobuf(lists.method.remove, create(StringValueSchema, { value: name }),)
            .then(async ({ error }) => {
                if (error === undefined) {
                    ctx.Info("remove successful")
                    mutate()
                } else {
                    ctx.Error(error.msg)
                    console.error(error.code, error.msg)
                }
            })
    }

    const handleSaveSettings = () => {
        setSaving(true)
        FetchProtobuf(lists.method.save_config, create(save_list_config_requestSchema, {
            refreshInterval: data.refreshConfig?.refreshInterval,
            maxminddbGeoip: data.maxminddbGeoip
        }))
            .then(async ({ error }) => {
                if (error === undefined) {
                    ctx.Info("save successful")
                    mutate()
                } else {
                    ctx.Error(error.msg)
                    console.error(error.code, error.msg)
                }
                setSaving(false)
            })
    }

    const handleCreate = (v: string) => {
        if (data.names.includes(v)) return;
        if (showdata.name === v && showdata.new) {
            setShowdata(prev => { return { ...prev, show: true } })
        } else {
            setShowdata({ show: true, name: v, new: true })
        }
    };

    const lastRefreshTime = data?.refreshConfig?.lastRefreshTime
        ? new Date(Number(data.refreshConfig.lastRefreshTime) * 1000).toLocaleString()
        : "Never";

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
                        FetchProtobuf(lists.method.refresh, create(EmptySchema))
                            .then(async ({ error }) => {
                                if (error === undefined) {
                                    ctx.Info("refresh successful")
                                    mutate()
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
                    items={data.names.sort((a, b) => a.localeCompare(b))}
                    renderListItem={(v) =>
                        <>
                            <FileText className="mr-4 text-gray-500 dark:text-gray-400" size={20} />
                            <span className="truncate font-medium flex-grow">{v}</span>
                            <ChevronRight className="text-gray-500 dark:text-gray-400 opacity-25" size={16} />
                        </>
                    }
                    onClickItem={(v) => setShowdata({ show: true, name: v, new: false })}
                    onAddNew={handleCreate}
                    adding={saving}
                    header={
                        <IconBox icon={ListChecks} color="#3b82f6" title="Defined Lists" description={`${data.names.length} Lists Available`} />
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

        const { data, error, isLoading, isValidating, mutate } = useSWR(name === "" ? undefined : ProtoPath(lists.method.get),
            ProtoESFetcher(
                lists.method.get,
                create(StringValueSchema, { value: name }),
                isNew ? create(listSchema, {
                    name: name, listType: list_list_type_enum.host, list: { case: "local", value: create(list_localSchema, { lists: [] }) }
                }) : undefined
            ),
            { shouldRetryOnError: false, keepPreviousData: false, revalidateOnFocus: false })

        useEffect(() => { mutate(); }, [name, isNew, mutate])

        const handleSave = () => {
            setLoadding(true)
            FetchProtobuf(lists.method.save, data)
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
                                <Single value={data} onChange={(e) => { mutate(e, false) }} />
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

    const isRemote = value.list.case === "remote";

    const handleModeChange = (remote: boolean) => {
        if (remote === isRemote) return;
        const currentData = value.list.case === "remote" ? value.list.value.urls : value?.list?.value?.lists ?? [];

        onChange({
            ...value,
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
                            value={value.listType}
                            onChange={(v) => onChange({ ...value, listType: v })}
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
                        {(value.list.case === "remote" ? value.list.value.urls : value?.list?.value?.lists ?? []).length} Entries
                    </Badge>
                </div>

                <div className="bg-secondary/10 p-4 rounded-md border border-gray-500/10">
                    <InputList
                        title={isRemote ? "URL" : "Rule"}
                        dump
                        data={value.list.case === "remote" ? value.list.value.urls : value?.list?.value?.lists ?? []}
                        onChange={(x) => {
                            onChange({
                                ...value,
                                list: isRemote ?
                                    { case: "remote", value: create(list_remoteSchema, { urls: x }) } :
                                    { case: "local", value: create(list_localSchema, { lists: x }) }
                            })
                        }}
                    />
                </div>
            </div>

            {/* 3. Error Messages Area */}
            {value.errorMsgs && value.errorMsgs.length > 0 && (
                <div className="mt-2">
                    <SettingLabel className="text-red-500 mb-2">Error Messages</SettingLabel>
                    <div className="p-4 bg-red-500/10 text-red-500 rounded-md text-xs font-mono">
                        {value.errorMsgs.map((msg, i) => <div key={i} className="mb-1">• {msg}</div>)}
                    </div>
                </div>
            )}
        </div>
    );
}