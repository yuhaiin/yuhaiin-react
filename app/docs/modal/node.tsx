import { useContext, useState } from "react";
import { Button, Modal, Form, Badge } from "react-bootstrap";
import useSWR from 'swr'
import { Fetch, ProtoTSStrFetcher } from '../common/proto';
import Loading from "../common/loading";
import Error from 'next/error';
import { GlobalToastContext } from "../common/toast";
import { yuhaiin, google } from "../pbts/proto";

const StringValue = google.protobuf.StringValue
const Point = yuhaiin.point.point

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

    const { data: node, error, isLoading, mutate } = useSWR(
        props.point && props.hash ? `/node` : null,
        ProtoTSStrFetcher<yuhaiin.point.point>(Point, "POST", StringValue.encode({ value: props.hash }).finish()))
    const [errmsg, setErrmsg] = useState({ msg: "", code: 0 });

    const Footer = () => {
        if (!props.editable) return <></>
        return <Button variant="primary" active={!isLoading && !error}
            onClick={() => {
                Fetch("/node",
                    {
                        method: "PATCH",
                        body: Point.encode(Point.fromObject(JSON.parse(node ?? props.point ?? "{}"))).finish(),
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
                    {error ? <Error statusCode={error.code} title={error.msg} /> : isLoading ? <Loading /> :
                        <Form.Control
                            as="textarea"
                            value={node ?? props.point}
                            style={{ height: "65vh", fontFamily: "monospace" }}
                            readOnly={!props.editable}
                            onChange={(e) => {
                                if (props.hash) mutate(e.target.value, false)
                                if (props.point && props.onChangePoint) props.onChangePoint(e.target.value)
                            }
                            }
                        />
                    }
                </Modal.Body>

                <Modal.Footer>
                    {errmsg.msg && <Badge bg="danger">{errmsg.code} | {errmsg.msg}</Badge>}
                    <Button variant="secondary" onClick={() => { props.onHide() }}>Close</Button>
                    <Footer />
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default NodeModal;