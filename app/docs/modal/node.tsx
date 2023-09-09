import { useContext, useState } from "react";
import { Button, Modal, Form, Badge } from "react-bootstrap";
import useSWR from 'swr'
import { JsonStrFetcher, Fetch, ProtoStrFetcher } from '../common/proto';
import { point as Point } from "../protos/node/point/point";
import Loading from "../common/loading";
import Error from 'next/error';
import { GlobalToastContext } from "../common/toast";
import { StringValue } from "../protos/google/protobuf/wrappers";


function NodeModal(props: {
    hash: string,
    point?: string,
    onChangePoint?: (v: string) => void,
    editable?: boolean,
    show: boolean,
    onHide: () => void,
    onSave?: () => void
}) {
    const ctx = useContext(GlobalToastContext);
    console.log(props.hash)

    const { data: node, error, isLoading, mutate } = useSWR(
        props.point === undefined && props.hash !== "" && props.hash !== undefined ? `/node` : null,
        ProtoStrFetcher<Point>(Point, "POST", StringValue.encode({ value: props.hash }).finish()))
    const [errmsg, setErrmsg] = useState({ msg: "", code: 0 });

    const Footer = () => {
        if (props.editable === undefined || !props.editable) return <></>
        return <Button variant="primary" active={!isLoading && error === undefined}
            onClick={() => {
                Fetch("/node",
                    {
                        method: "PATCH",
                        body: Point.encode(Point.fromJSON(JSON.parse(node !== undefined ? node : props.point !== undefined ? props.point : "{}"))).finish(),
                    })
                    .then(async ({ error }) => {
                        if (error === undefined) {
                            ctx.Info("save successful")
                            if (props.onSave !== undefined) props.onSave();
                            props.onHide();
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
                    {error !== undefined ? <Error statusCode={error.code} title={error.msg} /> : isLoading ? <Loading /> :
                        <Form.Control
                            as="textarea"
                            value={node !== undefined ? node : props.point}
                            style={{ height: "65vh", fontFamily: "monospace" }}
                            readOnly={!props.editable}
                            onChange={(e) => {
                                if (props.hash !== undefined)
                                    mutate(e.target.value, false)
                                if (props.point !== undefined && props.onChangePoint !== undefined) props.onChangePoint(e.target.value)
                            }
                            }
                        />
                    }
                </Modal.Body>

                <Modal.Footer>
                    {errmsg.msg !== "" && <Badge bg="danger">{errmsg.code} | {errmsg.msg}</Badge>}
                    <Button variant="secondary" onClick={() => { props.onHide() }}>Close</Button>
                    <Footer />
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default NodeModal;