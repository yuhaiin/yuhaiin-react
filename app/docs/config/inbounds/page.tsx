"use client"

import { clone, create } from "@bufbuild/protobuf"
import { StringValueSchema } from "@bufbuild/protobuf/wkt"
import Error from "next/error"
import React, { useContext, useEffect, useState } from "react"
import { Button, Card, Form, InputGroup, ListGroup, Modal } from "react-bootstrap"
import useSWR from "swr"
import Loading from "../../common/loading"
import { FetchProtobuf, ProtoESFetcher } from "../../common/proto"
import { GlobalToastContext } from "../../common/toast"
import { inbound as inboundService } from "../../pbes/config/grpc/config_pb"
import { inboundSchema } from "../../pbes/config/listener/listener_pb"
import { Inbound } from "./inboud"


const InboundModal = (
    props: {
        show: boolean,
        name: string,
        onHide: (save?: boolean) => void,
        isNew?: boolean,
    },
) => {
    const ctx = useContext(GlobalToastContext);

    // isValidating becomes true whenever there is an ongoing request whether the data is loaded or not
    // isLoading becomes true when there is an ongoing request and data is not loaded yet.
    const { data: inbound, error, isLoading, isValidating, mutate } = useSWR(props.name === "" ? undefined : `/inbound`,
        ProtoESFetcher(
            inboundService.method.get,
            "POST",
            create(StringValueSchema, { value: props.name }),
            props.isNew ? create(inboundSchema, { name: props.name, enabled: false }) : undefined
        ),
        {
            shouldRetryOnError: false,
            keepPreviousData: false,
            revalidateOnFocus: false,
        })

    useEffect(() => {
        mutate();
    }, [props.name, props.isNew])

    return (
        <>
            <Modal
                show={props.show}
                scrollable
                aria-labelledby="contained-modal-title-vcenter"
                size='xl'
                onHide={() => { props.onHide() }}
                centered
            >
                <Modal.Header>
                    <Modal.Title id="contained-modal-title-vcenter">{props.name}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {error ?
                        <>
                            <h4 className="text-center my-2">{error.code} - {error.msg}</h4>
                            <pre className="text-center my-2 text-danger lead">{error.raw}</pre>
                        </> :
                        isValidating || isLoading || !inbound ? <Loading /> :
                            <Inbound inbound={inbound} onChange={(x) => { mutate(clone(inboundSchema, x), false) }}></Inbound>
                    }
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={() => { props.onHide() }}>Close</Button>
                    <Button
                        variant="outline-primary"
                        onClick={() => {
                            FetchProtobuf(inboundService.method.save, "/inbound", "PATCH", inbound,)
                                .then(async ({ error }) => {
                                    if (error === undefined) {
                                        ctx.Info("save successful")
                                        props.onHide(true)
                                    } else {
                                        let msg = error.msg;
                                        ctx.Error(msg)
                                        console.error(error.code, msg)
                                    }
                                })
                        }}
                    >
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}


function InboudComponent() {
    const ctx = useContext(GlobalToastContext);

    const { data: inbounds, error, isLoading, mutate } = useSWR("/inbounds", ProtoESFetcher(inboundService.method.list))

    const [showdata, setShowdata] = useState({ show: false, name: "", new: false });
    const [newdata, setNewdata] = useState({ value: "" });

    if (error !== undefined) return <Error statusCode={error.code} title={error.msg} />
    if (isLoading || inbounds === undefined) return <Loading />

    const deleteInbound = (name: string) => {
        FetchProtobuf(inboundService.method.remove, "/inbound", "DELETE", create(StringValueSchema, { value: name }),)
            .then(async ({ error }) => {
                if (error === undefined) {
                    ctx.Info("remove successful")
                    mutate()
                } else {
                    let msg = error.msg;
                    ctx.Error(msg)
                    console.error(error.code, msg)
                }
            })
    }

    return <>
        <InboundModal
            show={showdata.show}
            name={showdata.name}
            onHide={(save) => {
                if (save) mutate();
                setShowdata({ ...showdata, show: false })
            }}
            isNew={showdata.new}
        />

        <Card>
            {inbounds.names.length === 0 && <Card.Body><div className="text-center my-2" style={{ opacity: '0.4' }}>No Inbounds</div>  </Card.Body>}
            {inbounds.names.length !== 0 && <ListGroup variant="flush">
                {inbounds.names.
                    sort((a, b) => { return a <= b ? -1 : 1 }).
                    map((v, k) => {
                        return <React.Fragment key={"inbounds-" + k}>
                            <ListGroup.Item
                                action
                                className="d-flex justify-content-between align-items-center"
                                style={{ border: "0ch", borderBottom: "1px solid #dee2e6" }}
                                onClick={(e) => { e.stopPropagation(); setShowdata({ show: true, name: v, new: false }) }}
                            >
                                {v}
                                <Button
                                    variant='outline-danger'
                                    size="sm"
                                    as={"span"}
                                    key={k + "span-button"}
                                    onClick={(e) => { e.stopPropagation(); deleteInbound(v) }}
                                >
                                    <i className="bi bi-x-lg"></i>
                                </Button>
                            </ListGroup.Item>
                        </React.Fragment>
                    })
                }
            </ListGroup>
            }
            <Card.Footer>
                <InputGroup className="d-flex justify-content-end">
                    <Form.Control value={newdata.value} onChange={(e) => setNewdata({ value: e.target.value })} />
                    <Button
                        variant='outline-success'
                        onClick={() => {
                            if (!newdata.value || inbounds.names.includes(newdata.value)) return
                            if (showdata.name === newdata.value && showdata.new)
                                setShowdata(prev => { return { ...prev, show: true } })
                            else
                                setShowdata({ show: true, name: newdata.value, new: true })
                        }}
                    >
                        <i className="bi bi-plus-lg" />New </Button>
                </InputGroup>
            </Card.Footer>

        </Card>
    </>
}

export default InboudComponent