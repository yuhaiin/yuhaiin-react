import { useContext, useState } from "react";
import { Button, Modal, Form, DropdownButton, Dropdown, ButtonGroup, Collapse } from "react-bootstrap";
import useSWR from 'swr'
import { Fetch, ProtoESFetcher } from '../common/proto';
import Loading from "../common/loading";
import { GlobalToastContext } from "../common/toast";
import { pointSchema, point } from "../pbes/node/point/point_pb";
import { Point } from "../node/protocol";
import { create, clone, toJsonString, fromJsonString, toBinary } from "@bufbuild/protobuf";
import { StringValueSchema } from "@bufbuild/protobuf/wkt";


export function NodeModal(props: {
    hash: string,
    point?: point,
    editable?: boolean,
    show: boolean,
    onHide: () => void,
    onSave?: () => void,
    groups?: string[],
    onDelete?: () => void,
    isNew?: boolean
}) {
    const ctx = useContext(GlobalToastContext);

    const [jsonShow, setJsonShow] = useState({ show: false, data: "" })

    const { data: node, error, isLoading, mutate } = useSWR(props.show ? `/node` : null,
        ProtoESFetcher(
            pointSchema,
            "POST",
            toBinary(StringValueSchema, create(StringValueSchema, { value: props.hash })),
            props.point,
        )
    )

    const SaveButton = () => {
        if (!props.editable) return <></>

        return <Button
            variant="outline-primary"
            disabled={isLoading || error || !props.editable}
            onClick={() => {
                if (!node) return
                if (props.isNew) node.hash = ""
                Fetch("/node",
                    {
                        method: "PATCH",
                        body: toBinary(pointSchema, node),
                    })
                    .then(async ({ error }) => {
                        if (!error) {
                            ctx.Info("save successful")
                            if (props.onSave) props.onSave();
                        } else {
                            let msg = await error.msg;
                            ctx.Error(msg)
                        }
                    })
            }}
        >
            Save
        </Button >
    }

    return (
        <>
            <NodeJsonModal
                show={jsonShow.show}
                data={jsonShow.data}
                plaintext
                onHide={() => { setJsonShow({ ...jsonShow, show: false }) }}
            />

            <Modal
                show={jsonShow.show ? false : props.show}
                scrollable
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
                    <fieldset disabled={!props.editable}>
                        {error ?
                            <>
                                <h4 className="text-center my-2">{error.code} - {error.msg}</h4>
                                <pre className="text-center my-2 text-danger lead">{error.raw}</pre>
                            </> :
                            isLoading || !node ? <Loading /> :
                                <Collapse in={!error && !isLoading}>
                                    <Point
                                        point={node}
                                        groups={props.groups}
                                        onChange={(e) => {
                                            if (!props.editable) return
                                            mutate(clone(pointSchema, e), false)
                                        }}
                                    />
                                </Collapse>
                        }
                    </fieldset>
                </Modal.Body>

                <Modal.Footer>
                    {props.onDelete &&
                        <DropdownButton
                            onSelect={(event) => {
                                if (event === "ok" && props.onDelete) {
                                    props.onHide();
                                    props.onDelete();
                                }
                            }}
                            as={ButtonGroup}
                            variant="outline-danger"
                            title="Remove"
                        >
                            <Dropdown.Item eventKey={"ok"}>OK</Dropdown.Item>
                            <Dropdown.Item eventKey={"cancel"}>Cancel</Dropdown.Item>
                        </DropdownButton>
                    }
                    {(!error && !isLoading && node) &&
                        <Button
                            variant="outline-primary"
                            onClick={() => {
                                setJsonShow({ show: true, data: toJsonString(pointSchema, node, { prettySpaces: 2 }) });
                                // navigator.clipboard.writeText(JSON.stringify(po.toJson({ emitDefaultValues: true }), null, 2));
                            }}
                        >
                            JSON
                        </Button>
                    }
                    <Button variant="outline-secondary" onClick={() => { props.onHide() }}>Close</Button>
                    <SaveButton />
                </Modal.Footer>
            </Modal>
        </>
    );
}

export const NodeJsonModal = (
    props: {
        show: boolean,
        plaintext?: boolean,
        data?: string,
        onSave?: () => void
        onHide: () => void,
        isNew?: boolean
    },
) => {
    const ctx = useContext(GlobalToastContext);
    const [nodeJson, setNodeJson] = useState({ data: "" });
    const Footer = () => {
        if (!props.onSave) return <></>
        return <Button variant="outline-primary"
            onClick={() => {
                let p = fromJsonString(pointSchema, nodeJson.data);
                if (props.isNew) p.hash = ""
                Fetch("/node",
                    {
                        method: "PATCH",
                        body: toBinary(pointSchema, p),
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
                {!props.plaintext &&
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            Import JSON
                        </Modal.Title>
                    </Modal.Header>
                }

                <Modal.Body>
                    <Form.Control
                        as="textarea"
                        readOnly={props.plaintext}
                        value={props.data ? props.data : nodeJson.data}
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
