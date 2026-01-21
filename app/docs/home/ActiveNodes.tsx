"use client"

import { create } from "@bufbuild/protobuf";
import { StringValueSchema } from "@bufbuild/protobuf/wkt";
import Error from 'next/error';
import { FC, useContext, useState } from "react";
import { Button, Card } from "react-bootstrap";
import styles from './activate.module.css';
import { ConfirmModal } from "../common/confirm";
import Loading from "../common/loading";
import { FetchProtobuf, useProtoSWR } from '../common/proto';
import { GlobalToastContext } from "../common/toast";
import { NodeModal } from "../node/modal";
import { node } from "../pbes/api/node_pb";
import { point, pointSchema } from "../pbes/node/point_pb";

const IconBadge: FC<{ icon: string, text: string }> = ({ icon, text }) => (
    <span className={styles['icon-badge']}>
        <i className={`bi ${icon} me-1`}></i>
        {text}
    </span>
);

const ActiveNodeItem: FC<{ v: point, setModalHash: (a: any) => void, setConfirmData: (a: any) => void }> = ({ v, setModalHash, setConfirmData }) => {
    return (
        <li
            className={styles['list-item']}
            onClick={() => setModalHash({ hash: v.hash, show: true, point: v })}
        >
            <div className={styles['item-main']}>
                <code className={styles['item-id']}> {v.name ? v.name : <span className="opacity-50 fst-italic">Unnamed Node</span>}</code>
                <span className={styles['item-addr']}>{v.hash}</span>
            </div>

            <div className={styles['item-details-right']}>

                <div className={styles['item-details']}>
                    {v.group && <IconBadge icon="bi-collection" text={v.group} />}
                    <Button
                        variant="link"
                        size="sm"
                        className="p-0 text-danger opacity-50 opacity-100-hover ms-1"
                        style={{ width: '24px', height: '24px' }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setConfirmData({ show: true, name: v.hash })
                        }}
                    >
                        <i className="bi bi-power"></i>
                    </Button>
                </div>
            </div>
        </li>
    )
}

const ActiveNodes = () => {
    const ctx = useContext(GlobalToastContext);
    const { data, error, isLoading, mutate } = useProtoSWR(node.method.activates)
    const [modalHash, setModalHash] = useState({ hash: "", show: false, point: create(pointSchema, {}) });
    const [confirmData, setConfirmData] = useState({ show: false, name: "" });

    if (error !== undefined) return <Error statusCode={error.code} title={error.msg} />
    if (isLoading || data == undefined) return <Card><Card.Body><Loading /></Card.Body></Card>

    return (
        <>
            <ConfirmModal
                show={confirmData.show}
                content={
                    <div className="text-center">
                        <i className="bi bi-exclamation-circle text-warning display-4 mb-3 d-block"></i>
                        <p className="mb-0">Close node <br /><span className="font-monospace fw-bold">{confirmData.name}</span>?</p>
                    </div>
                }
                onHide={() => setConfirmData({ ...confirmData, show: false })}
                onOk={() => {
                    FetchProtobuf(node.method.close, create(StringValueSchema, { value: confirmData.name }))
                        .then(async ({ error }) => {
                            if (error !== undefined) ctx.Error(`Close node ${confirmData.name} failed, ${error.code}| ${error.msg}`)
                            else {
                                ctx.Info(`Node ${confirmData.name} closed successfully`);
                                await mutate();
                            }
                            setConfirmData({ ...confirmData, show: false })
                        })
                }}
            />

            <NodeModal
                show={modalHash.show}
                hash={modalHash.hash}
                point={modalHash.point}
                onHide={() => setModalHash({ ...modalHash, show: false })}
            />

            <Card className="shadow-sm mb-3" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--sidebar-border-color)' }}>
                <Card.Header className="bg-body border-bottom pt-3 px-3 pb-2">
                    <h6 className="fw-bold m-0 text-uppercase ls-1 small text-muted">
                        <i className="bi bi-activity me-2 text-success"></i>
                        Active Nodes
                    </h6>
                </Card.Header>

                <ul className="list-unstyled m-0 p-0">
                    {
                        data.nodes.length > 0 ?
                            data.nodes
                                .sort((a, b) => a.hash.localeCompare(b.hash))
                                .map((v) => {
                                    return <ActiveNodeItem key={v.hash} v={v} setModalHash={setModalHash} setConfirmData={setConfirmData} />
                                })
                            :
                            <li className="text-center text-muted py-5">
                                <i className="bi bi-hdd-network display-6 mb-3 d-block opacity-25"></i>
                                <span>No active nodes connected</span>
                            </li>
                    }
                </ul>
            </Card >
        </>
    )
}

export default ActiveNodes;