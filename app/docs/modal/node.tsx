import { useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { APIUrl } from "../apiurl";
import useSWR from 'swr'
import { JsonStrFetcher } from '../common/proto';
import { point as Point } from "../protos/node/point/point";
import Loading from "../common/loading";

function NodeModal(props: { hash: string, editable: boolean, show: boolean, onHide: () => void, onSave?: () => void }) {

    const { data: node, error, isLoading, mutate } =
        useSWR(props.hash !== "" ? `${APIUrl}/node?hash=${props.hash}` : null, JsonStrFetcher)

    const Footer = () => {
        if (!props.editable) return <></>
        return <Button variant="primary" active={!isLoading && error === undefined}
            onClick={async () => {
                const resp = await fetch(APIUrl + "/node", {
                    method: "POST",
                    headers: {
                        'content-type': 'application/json;charset=UTF-8',
                    },
                    body: node,
                })
                if (!resp.ok) console.log(await resp.text())
                else {
                    console.log("save successful")

                    if (props.onSave !== undefined) props.onSave();
                    props.onHide();
                }
            }
            }
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
                    {error !== undefined ? <>error.info</> : isLoading ? <Loading /> :
                        <Form.Control
                            as="textarea"
                            value={node}
                            style={{ height: "65vh", fontFamily: "monospace" }}
                            readOnly={!props.editable}
                            onChange={(e) => mutate(e.target.value, false)}
                        />
                    }
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => { props.onHide() }}>Close</Button>
                    <Footer />
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default NodeModal;