import { Spinner } from "react-bootstrap";
import Error from 'next/error'

function Loading(props: { children?: string, code?: number }) {
    return (
        <div
            className="z-1090 d-flex flex-column justify-content-center align-items-center"
            style={{ height: "100px" }}
        >
            {props.children !== undefined && <><Error className="p2" statusCode={props.code !== undefined ? props.code : 500} title={props.children}></Error></>}
            <div className="p2"><Spinner /></div>
        </div >
    )
}

export default Loading;