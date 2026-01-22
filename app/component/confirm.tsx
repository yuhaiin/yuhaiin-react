import { FC, JSX } from "react";
import { Button, Modal } from "react-bootstrap";


export const ConfirmModal: FC<{ content: JSX.Element, show: boolean, onOk: () => void, onHide: () => void }> = ({ onOk, content, show, onHide }) => {
    return <Modal show={show} onHide={onHide} centered>
        <Modal.Body>{content}</Modal.Body>
        <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => { onHide() }}>Cancel</Button>
            <Button variant="outline-danger" onClick={() => { onOk(); onHide() }}>OK</Button>
        </Modal.Footer>
    </Modal>
}