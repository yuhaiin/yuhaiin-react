import { useContext, useEffect, useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { APIUrl } from "../apiurl";
import { GlobalToastContext } from "../common/toast";


function NodeModal(props: { hash: string, editable: boolean, onHide: () => void, onSave?: () => void }) {
    const [node, setNode] = useState({ value: "" });
    const [show, setShow] = useState({ value: true });


    const ctx = useContext(GlobalToastContext);

    useEffect(() => {
        (async () => {
            try {
                await fetch(
                    APIUrl + "/node?hash=" + props.hash,
                    {
                        method: "GET",
                    },
                ).then(async (resp) => {
                    setNode({ value: JSON.stringify(await resp.json(), null, "  ") })
                })

            } catch (e) {
                ctx.Error(`Get Node ${props.hash} Failed. ${e}`)
                console.log(e)
            }
        })()
    }, [ctx, props.hash])

    return (
        <>
            <Modal
                show={show.value}
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
                    <Form.Control
                        as="textarea"
                        value={node.value}
                        style={{ height: "65vh", fontFamily: "monospace" }}
                        readOnly={!props.editable}
                        onChange={(e) => setNode({ value: e.target.value })}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => { setShow({ value: false }); props.onHide() }}>Close</Button>
                    {props.editable &&
                        <Button variant="primary"
                            onClick={async () => {
                                const resp = await fetch(APIUrl + "/node", {
                                    method: "POST",
                                    headers: {
                                        'content-type': 'application/json;charset=UTF-8',
                                    },
                                    body: node.value,
                                })
                                if (!resp.ok) console.log(await resp.text())
                                else {
                                    console.log("save successful")

                                    if (props.onSave !== undefined) props.onSave();

                                    setShow({ value: false });
                                    props.onHide();
                                }
                            }
                            }
                        >
                            Save
                        </Button>
                    }
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default NodeModal;