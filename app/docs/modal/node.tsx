import { useContext, useState } from "react";
import { Button, Modal, Form, Badge } from "react-bootstrap";
import useSWR from 'swr'
import { Fetch, ProtoESFetcher, ProtoESStrFetcher } from '../common/proto';
import Loading from "../common/loading";
import Error from 'next/error';
import { GlobalToastContext } from "../common/toast";
import { point } from "../pbes/node/point/point_pb";
import { StringValue } from "@bufbuild/protobuf";
import { Point } from "../node/protocol";


function NodeModal(props: {
    hash: string,
    point?: point,
    onChangePoint?: (v: point) => void,
    editable?: boolean,
    show: boolean,
    onHide: () => void,
    onSave?: () => void
}) {
    const ctx = useContext(GlobalToastContext);

    const { data: node, error, isLoading, mutate } = useSWR(
        (!props.point && props.hash) ? `/node` : null,
        ProtoESFetcher(new point(), "POST", new StringValue({ value: props.hash }).toBinary()))
    const [errmsg, setErrmsg] = useState({ msg: "", code: 0 });

    const Footer = () => {
        if (!props.editable) return <></>
        return <Button
            variant="outline-primary"
            disabled={isLoading || error || !props.editable}
            onClick={() => {
                Fetch("/node",
                    {
                        method: "PATCH",
                        body: (node ?? props.point ?? new point({})).toBinary(),
                    })
                    .then(async ({ error }) => {
                        if (error === undefined) {
                            ctx.Info("save successful")
                            if (props.onSave !== undefined) props.onSave();
                            // props.onHide();
                        } else {
                            let msg = await error.msg;
                            ctx.Error(msg)
                            setErrmsg({ msg: msg, code: error.code })
                            setTimeout(() => { setErrmsg({ msg: "", code: 0 }) }, 5000)
                        }
                    })
            }}
        >
            Save
        </Button>
    }

    return (
        <>
            <Modal
                show={props.show}
                aria-labelledby="contained-modal-title-vcenter"
                size='xl'
                onHide={() => { props.onHide() }}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        {props.hash}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {error ? <Error statusCode={error.code} title={error.msg} /> : isLoading ? <Loading /> :
                        <Point
                            point={node ?? props.point ?? new point({})}
                            onChange={
                                (props.editable) ?
                                    (e) => {
                                        if (!props.editable) return
                                        if (props.hash) mutate(e, false)
                                        if (props.point && props.onChangePoint) props.onChangePoint(e)
                                    } : undefined
                            }
                        />
                    }
                </Modal.Body>

                <Modal.Footer>
                    {errmsg.msg && <Badge bg="danger">{errmsg.code} | {errmsg.msg}</Badge>}
                    <Button
                        variant="outline-info"
                        onClick={() => {
                            try {
                                let po = node?.clone() ?? props.point?.clone() ?? new point({});
                                po.hash = "";
                                navigator.clipboard.writeText(JSON.stringify(po.toJson({ emitDefaultValues: true }), null, 2));
                                ctx.Info("copy successful")
                            } catch (e) {
                                ctx.Error("copy failed")
                            }
                        }}
                    >
                        Copy
                    </Button>
                    <Button variant="outline-secondary" onClick={() => { props.onHide() }}>Close</Button>
                    <Footer />
                </Modal.Footer>
            </Modal>
        </>
    );
}

export const NodeJsonModal = (
    props: {
        show: boolean,
        onSave?: () => void
        onHide: () => void,
    },
) => {
    const ctx = useContext(GlobalToastContext);
    const [nodeJson, setNodeJson] = useState({ data: "" });
    const Footer = () => {
        return <Button variant="outline-primary"
            onClick={() => {
                Fetch("/node",
                    {
                        method: "PATCH",
                        body: (new point().fromJson(JSON.parse(nodeJson.data))).toBinary(),
                    })
                    .then(async ({ error }) => {
                        if (error === undefined) {
                            ctx.Info("save successful")
                            if (props.onSave !== undefined) props.onSave();
                        } else {
                            let msg = await error.msg;
                            ctx.Error(msg)
                        }
                    })
            }}
        >
            Save
        </Button>
    }
    return (
        <>
            <Modal
                show={props.show}
                aria-labelledby="contained-modal-title-vcenter"
                size='xl'
                onHide={() => { props.onHide() }}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Import JSON
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form.Control
                        as="textarea"
                        value={nodeJson.data}
                        style={{ height: "65vh", fontFamily: "monospace" }}
                        onChange={(e) => { setNodeJson({ data: e.target.value }); }}
                    />
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={() => { props.onHide() }}>Close</Button>
                    <Footer />
                </Modal.Footer>
            </Modal>
        </>
    );
}
export default NodeModal;