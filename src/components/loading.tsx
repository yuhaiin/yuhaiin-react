import { Modal, Placeholder, Card, Spinner, Col, Row, Overlay } from "react-bootstrap";

function Loading() {
    return (
        <>
            <div
                className="z-1090 d-flex justify-content-center align-items-center"
                style={{ height: "100px" }}
            >
                <Spinner />
            </div >
        </>
    )
}

export default Loading;