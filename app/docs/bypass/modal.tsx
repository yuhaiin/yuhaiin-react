import { FC, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";

export const JsonModal: FC<{
    show: boolean,
    plaintext?: boolean,
    data?: string,
    onSave?: (data: string) => void
    onHide: () => void,
}> = ({ show, plaintext, data, onSave, onHide }) => {
    const [nodeJson, setNodeJson] = useState({ data: "" });
    const Footer = () => {
        if (!onSave) return <></>
        return <Button variant="outline-primary"
            onClick={() => {
                if (onSave) onSave(nodeJson.data)
            }}
        >
            Save
        </Button>
    }
    return (
        <>
            <Modal
                show={show}
                aria-labelledby="contained-modal-title-vcenter"
                size='xl'
                onHide={() => { onHide() }}
                centered
            >
                {!plaintext &&
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            Import JSON
                        </Modal.Title>
                    </Modal.Header>
                }

                <Modal.Body>
                    <Form.Control
                        as="textarea"
                        readOnly={plaintext}
                        value={data ? data : nodeJson.data}
                        style={{ height: "65vh", fontFamily: "monospace" }}
                        onChange={(e) => { setNodeJson({ data: e.target.value }); }}
                    />
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={() => { onHide() }}>Close</Button>
                    <Footer />
                </Modal.Footer>
            </Modal>
        </>
    );
}
