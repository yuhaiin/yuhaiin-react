import { create, fromJsonString, toJsonString } from "@bufbuild/protobuf";
import { StringValueSchema } from "@bufbuild/protobuf/wkt";
import { FC, useContext, useEffect, useState } from "react";
import { Button, ButtonGroup, Dropdown, DropdownButton, Form, Modal } from "react-bootstrap";
import useSWR from 'swr';
import { Interfaces, InterfacesContext } from "../common/interfaces";
import Loading, { Error } from "../common/loading";
import { FetchProtobuf, ProtoESFetcher } from '../common/proto';
import { GlobalToastContext } from "../common/toast";
import { node } from "../pbes/node/grpc/node_pb";
import { point, pointSchema } from "../pbes/node/point/point_pb";
import { Point } from "./protocol";


export const NodeModal: FC<{
    hash: string,
    point?: point,
    editable?: boolean,
    show: boolean,
    onHide: () => void,
    onSave?: () => void,
    groups?: string[],
    onDelete?: () => void,
    isNew?: boolean
}> =
    ({ hash, point, editable, show, onHide, onSave, groups, onDelete, isNew }) => {
        const ctx = useContext(GlobalToastContext);

        const [jsonShow, setJsonShow] = useState({ show: false, data: "" })

        const interfaces = Interfaces();

        // isValidating becomes true whenever there is an ongoing request whether the data is loaded or not
        // isLoading becomes true when there is an ongoing request and data is not loaded yet.
        const { data: nodes, error, isLoading, isValidating, mutate } = useSWR(hash === "" ? undefined : `/node`,
            ProtoESFetcher(node.method.get, "POST", create(StringValueSchema, { value: hash }), point,),
            {
                shouldRetryOnError: false,
                keepPreviousData: false,
                revalidateOnFocus: false,
            })

        useEffect(() => { mutate(); }, [hash, mutate])

        const SaveButton = () => {
            if (!editable) return <></>

            return <Button
                variant="outline-primary"
                disabled={isValidating || isLoading || error || !editable}
                onClick={() => {
                    if (!nodes) return
                    if (isNew) nodes.hash = ""
                    FetchProtobuf(node.method.save, "/node", "PATCH", nodes)
                        .then(async ({ error }) => {
                            if (!error) {
                                ctx.Info("save successful")
                                if (onSave) onSave();
                            } else ctx.Error(error.msg)
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
                    onHide={() => setJsonShow({ ...jsonShow, show: false })}
                />

                <Modal
                    show={jsonShow.show ? false : show}
                    scrollable
                    aria-labelledby="contained-modal-title-vcenter"
                    size='xl'
                    onHide={() => { onHide() }}
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            {hash}
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <fieldset disabled={!editable}>
                            {error ?
                                <>
                                    <Error statusCode={error.code} title={error.msg} raw={error.raw} />
                                </> :
                                isValidating || isLoading || !nodes ? <Loading /> :
                                    <InterfacesContext value={interfaces}>
                                        <Point
                                            value={nodes}
                                            groups={groups}
                                            onChange={(e) => {
                                                if (!editable) return
                                                mutate(e, false)
                                            }}
                                        />
                                    </InterfacesContext>
                            }
                        </fieldset>
                    </Modal.Body>

                    <Modal.Footer>
                        {onDelete &&
                            <DropdownButton
                                onSelect={(event) => {
                                    if (event === "ok" && onDelete) {
                                        onHide();
                                        onDelete();
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
                        {(!error && !isValidating && !isLoading && nodes) &&
                            <Button
                                variant="outline-primary"
                                onClick={() => {
                                    setJsonShow({ show: true, data: toJsonString(pointSchema, nodes, { prettySpaces: 2 }) });
                                    // navigator.clipboard.writeText(JSON.stringify(po.toJson({ emitDefaultValues: true }), null, 2));
                                }}
                            >
                                JSON
                            </Button>
                        }
                        <Button variant="outline-secondary" onClick={() => { onHide() }}>Close</Button>
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
                const p = fromJsonString(pointSchema, nodeJson.data);
                if (props.isNew) p.hash = ""
                FetchProtobuf(node.method.save, "/node", "PATCH", p)
                    .then(async ({ error }) => {
                        if (error === undefined) {
                            ctx.Info("save successful")
                            if (props.onSave !== undefined) props.onSave();
                        } else ctx.Error(error.msg)
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
