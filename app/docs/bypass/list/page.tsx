"use client";

import { Card, CardBody, CardFooter, CardHeader, CardRowList, ErrorBox, IconBox, SettingLabel, SettingsBox } from '@/app/component/cardlist';
import { create } from "@bufbuild/protobuf";
import { EmptySchema, StringValueSchema } from "@bufbuild/protobuf/wkt";
import { FC, useContext, useEffect, useState } from "react";
import { Alert, Button, Form, Modal, Spinner } from "react-bootstrap";
import useSWR from "swr";
import { NewItemList, SettingInputText } from "../../../component/components";
import { ConfirmModal } from "../../../component/confirm";
import Loading, { Error } from "../../../component/loading";
import { SettingTypeSelect } from "../../../component/switch";
import { GlobalToastContext } from "../../../component/toast";
import { FetchProtobuf, ProtoESFetcher, ProtoPath, useProtoSWR } from "../../common/proto";
import { lists, save_list_config_requestSchema } from "../../pbes/api/config_pb";
import { list, list_list_type_enum, list_list_type_enumSchema, list_localSchema, list_remoteSchema, listSchema, refresh_configSchema } from "../../pbes/config/bypass_pb";


export default function Lists() {
    const ctx = useContext(GlobalToastContext);
    const { data, error, isLoading, mutate } = useProtoSWR(lists.method.list, { revalidateOnFocus: false })

    const [showdata, setShowdata] = useState({ show: false, name: "", new: false });
    const [confirm, setConfirm] = useState<{ show: boolean, name: string }>({ show: false, name: "" });
    const [refresh, setRefresh] = useState(false)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (!data) return
        if (!data.refreshConfig) {
            mutate(prev => {
                return { ...prev, refreshConfig: create(refresh_configSchema, { refreshInterval: BigInt(0), }) }
            }, false)
        }
    }, [data, mutate])

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

    return <div>
        <ConfirmModal
            show={confirm.show}
            content={<>Are you sure to delete <span className="fw-bold text-danger">{confirm.name}</span>?</>}
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
        <div className="d-flex flex-wrap justify-content-between align-items-end mb-4 gap-3">
            <div>
                <h4 className="fw-bold mb-1">List Management</h4>
                <div className="text-muted d-flex align-items-center">
                    <i className="bi bi-clock-history me-2"></i>
                    <span className="small">Last Synced: <span className="fw-medium text-body">{lastRefreshTime}</span></span>
                </div>
            </div>

            <Button
                variant='primary'
                disabled={refresh}
                className="d-flex align-items-center gap-2 px-3 shadow-sm"
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
                {refresh ? <Spinner animation="border" size="sm" as="span" /> : <i className="bi bi-arrow-repeat"></i>}
                <span>Sync All Resources</span>
            </Button>
        </div>

        {/* --- 2. Configuration Card --- */}
        <Card >
            <CardHeader>
                <IconBox icon="sliders2" color="#a855f7" title="Configuration" description="Auto-fetch Interval & GeoIP" />
            </CardHeader>

            <CardBody>
                {/* 1. Auto-fetch Interval (Single Line) */}
                <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-end mb-2">
                        <label className="form-label fw-bold mb-0">Auto-fetch Interval</label>
                        <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">
                            {data.refreshConfig?.refreshInterval && Number(data.refreshConfig?.refreshInterval) > 0
                                ? `${Number(data.refreshConfig?.refreshInterval) / 60} Hours`
                                : "Disabled"}
                        </span>
                    </div>

                    {data.refreshConfig?.error && <Alert variant="danger" className="py-2 mb-2"><i className="bi bi-exclamation-circle me-2"></i>{data.refreshConfig.error}</Alert>}

                    <div className="px-1">
                        <Form.Range
                            value={Number(data.refreshConfig?.refreshInterval) / 60}
                            min={0} max={24 * 30} step={1}
                            style={{ cursor: 'pointer' }}
                            onChange={(e) => mutate(prev => ({
                                ...prev,
                                refreshConfig: {
                                    ...prev.refreshConfig,
                                    refreshInterval: BigInt(Number(e.target.value) * 60)
                                }
                            }), false)}
                        />
                        <div className="d-flex justify-content-between text-muted small mt-1 opacity-75">
                            <span>Disabled</span>
                            <span>15 Days</span>
                            <span>30 Days</span>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <hr className="border-secondary opacity-10 my-4" />

                {/* 2. GeoIP URL (single line) */}
                <div>
                    {data.maxminddbGeoip?.error && <Alert variant="danger" className="py-2 mb-2">{data.maxminddbGeoip.error}</Alert>}
                    <SettingInputText
                        label="Maxmind GeoIP Database URL"
                        placeholder="e.g. https://github.com/P3TERX/GeoLite.mmdb/raw/download/GeoLite2-Country.mmdb"
                        value={data.maxminddbGeoip?.downloadUrl}
                        onChange={(e) => {
                            mutate(prev => { return { ...prev, maxminddbGeoip: { ...prev.maxminddbGeoip, downloadUrl: e.toString() } } }, false)
                        }}
                    />
                </div>
            </CardBody>

            <CardFooter>
                <div className="d-flex justify-content-end w-100">
                    <Button variant='outline-primary' disabled={saving} onClick={handleSaveSettings}>
                        {saving ? <Spinner as="span" animation="border" size="sm" /> : <><i className="bi bi-check2 me-1"></i> Save Configuration</>}
                    </Button>
                </div>
            </CardFooter>
        </Card>

        <CardRowList
            items={data.names.sort((a, b) => a.localeCompare(b))}
            renderListItem={(v) =>
                <>
                    <i className="bi bi-file-text me-3 fs-4 text-secondary"></i>
                    <span className="text-truncate fw-medium flex-grow-1">{v}</span>
                    <i className="bi bi-chevron-right text-muted opacity-25"></i>
                </>
            }
            onClickItem={(v) => setShowdata({ show: true, name: v, new: false })}
            onAddNew={handleCreate}
            adding={saving}
            header={
                <IconBox icon="list-check" color="primary" title="Defined Lists" description={`${data.names.length} Lists Available`} />
            }
        />
    </div>
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

        return <>
            <Modal show={show} onHide={() => onHide()} centered scrollable size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error ?
                        <Error statusCode={error.code} title={error.msg} /> :
                        isValidating || isLoading || !data ? <Loading /> :
                            <Single value={data} onChange={(e) => { mutate(e, false) }} />
                    }
                </Modal.Body>
                <Modal.Footer className="d-flex justify-content-between">
                    <div>
                        {!isNew && name !== "bootstrap" && onDelete && (
                            <Button
                                variant="outline-danger"
                                onClick={() => { onHide(false); onDelete(name); }}
                            >
                                <i className="bi bi-trash me-1"></i> Delete
                            </Button>
                        )}
                    </div>

                    <div className="d-flex gap-2">
                        <Button variant="outline-secondary" onClick={() => onHide()}>Close</Button>
                        <Button
                            variant="primary"
                            disabled={loadding}
                            onClick={handleSave}
                        >
                            {loadding ? <Spinner as="span" animation="border" size="sm" /> : <><i className="bi bi-check-lg me-1"></i> Save</>}
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </>
    }

const Single: FC<{ value: list, onChange: (x: list) => void }> = ({ value, onChange }) => {

    const isRemote = value.list.case === "remote";

    const handleModeChange = (remote: boolean) => {
        if (remote === isRemote) return;
        const currentData = value.list.case === "remote" ? value.list.value.urls : value.list.value.lists;

        onChange({
            ...value,
            list: remote ?
                { case: "remote", value: create(list_remoteSchema, { urls: currentData }) } :
                { case: "local", value: create(list_localSchema, { lists: currentData }) }
        });
    };

    return (
        <div className="d-flex flex-column gap-4">
            {/* 1. Top Settings Area */}
            <SettingsBox>
                <div className="d-flex flex-column gap-4">
                    {/* Row 1: Content Type */}
                    <div>
                        <SettingTypeSelect
                            label='Content Type'
                            type={list_list_type_enumSchema}
                            value={value.listType}
                            onChange={(v) => onChange({ ...value, listType: v })}
                        />
                    </div>

                    {/* Divider */}
                    <hr className="my-0 border-secondary opacity-10" />

                    {/* Row 2: Source Mode */}
                    <div>
                        <SettingLabel>
                            Source Mode
                        </SettingLabel>
                        <div className="btn-group w-100" role="group">
                            <input
                                type="radio"
                                className="btn-check"
                                name="sourceMode"
                                id="mode-local"
                                autoComplete="off"
                                checked={!isRemote}
                                onChange={() => handleModeChange(false)}
                            />
                            <label className={`btn py-2 ${!isRemote ? 'btn-primary' : 'btn-outline-secondary'}`} htmlFor="mode-local">
                                <i className="bi bi-hdd-network me-2"></i>Local Manual List
                            </label>

                            <input
                                type="radio"
                                className="btn-check"
                                name="sourceMode"
                                id="mode-remote"
                                autoComplete="off"
                                checked={isRemote}
                                onChange={() => handleModeChange(true)}
                            />
                            <label className={`btn py-2 ${isRemote ? 'btn-primary' : 'btn-outline-secondary'}`} htmlFor="mode-remote">
                                <i className="bi bi-cloud-arrow-down me-2"></i>Remote Subscribe URL
                            </label>
                        </div>
                    </div>
                </div>
            </SettingsBox>

            {/* 2. List Editor Area */}
            <div>
                <div className="mb-2 d-flex justify-content-between align-items-end">
                    <div>
                        <h6 className="fw-bold mb-1">
                            {isRemote ? "Remote Resource URLs" : "Local Rules"}
                        </h6>
                        <small className="text-muted">
                            {isRemote
                                ? "Files will be downloaded and updated automatically."
                                : "Define rules manually (Domain, IP CIDR, etc)."}
                        </small>
                    </div>
                    <span className="badge bg-secondary bg-opacity-10 text-secondary">
                        {(value.list.case === "remote" ? value.list.value.urls : value.list.value.lists).length} Entries
                    </span>
                </div>

                <NewItemList
                    title=""
                    textarea
                    dump
                    data={value.list.case === "remote" ? value.list.value.urls : value.list.value.lists}
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

            {/* 3. Error Messages Area */}
            <ErrorBox msgs={value.errorMsgs} />
        </div>
    );
}