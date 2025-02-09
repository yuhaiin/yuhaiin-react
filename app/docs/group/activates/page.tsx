"use client"

import { create } from "@bufbuild/protobuf";
import { StringValueSchema } from "@bufbuild/protobuf/wkt";
import Error from 'next/error';
import { FC, useContext, useState } from "react";
import { Badge, Button, Card, ListGroup } from "react-bootstrap";
import { ConfirmModal } from "../../common/confirm";
import Loading from "../../common/loading";
import { FetchProtobuf, useProtoSWR } from '../../common/proto';
import { GlobalToastContext } from "../../common/toast";
import { NodeModal } from "../../node/modal";
import { node } from "../../pbes/node/grpc/node_pb";
import { point, pointSchema } from "../../pbes/node/point/point_pb";

function Activates() {
    const ctx = useContext(GlobalToastContext);
    const { data, error, isLoading, mutate } = useProtoSWR(node.method.activates)
    const [modalHash, setModalHash] = useState({ hash: "", show: false, point: create(pointSchema, {}) });
    const [confirmData, setConfirmData] = useState({ show: false, name: "" });

    if (error !== undefined) return <Error statusCode={error.code} title={error.msg} />

    if (isLoading || data == undefined) return <Loading />

    const TagItem: FC<{ v: point }> = ({ v }) => {
        return (
            <ListGroup.Item
                className="align-items-center d-flex justify-content-between"
                style={{ border: "0ch", borderBottom: "1px solid #dee2e6" }}
                key={v.hash}
            >
                <div>
                    <Badge className="rounded-pill bg-light text-dark ms-1">  <a
                        className="text-truncate"
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setModalHash({ hash: v.hash, show: true, point: v })
                        }} >
                        {v.hash}
                    </a></Badge>
                    <Badge className="rounded-pill bg-light text-dark ms-1">{v.group}</Badge>
                    <Badge className="rounded-pill bg-light text-dark ms-1">{v.name}</Badge>
                </div>

                <Button
                    variant="outline-danger"
                    as="span"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); setConfirmData({ show: true, name: v.hash }) }}
                >
                    <i className="bi-x-lg"></i></Button>
            </ListGroup.Item>
        )
    }


    return (
        <>
            <ConfirmModal
                show={confirmData.show}
                content={<p>Close node {confirmData.name}?</p>}
                onHide={() => setConfirmData({ ...confirmData, show: false })}
                onOk={() => {
                    FetchProtobuf(node.method.close, create(StringValueSchema, { value: confirmData.name }))
                        .then(async ({ error }) => {
                            if (error !== undefined) ctx.Error(`delete tag ${confirmData.name} failed, ${error.code}| ${error.msg}`)
                            else {
                                ctx.Info(`delete tag ${confirmData.name} success`);
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

            <Card className="mb-3">

                <ListGroup variant="flush">
                    {
                        data.nodes.map((v) => { return <TagItem key={v.hash} v={v} /> })
                    }
                </ListGroup>
            </Card >

        </>
    )
}

export default Activates;