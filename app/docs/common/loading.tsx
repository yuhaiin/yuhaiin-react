import { FC } from 'react';
import { Spinner } from "react-bootstrap";

function Loading(props: { children?: string, code?: number }) {
    return (
        <div
            className="z-1090 d-flex flex-column justify-content-center align-items-center"
            style={{ height: "100px" }}
        >
            {props.children !== undefined && <><Error statusCode={props.code !== undefined ? props.code : 500} title={props.children}></Error></>}
            <div className="p2"><Spinner /></div>
        </div >
    )
}


export const Error: FC<{ statusCode?: number, title?: string }> = ({ statusCode, title }) => {
    return <>
        <p className='fw-bold fs-3'>{statusCode} | <a className='text-reset text-decoration-none fs-6 fw-normal'>{title}</a></p>

    </>
}

export default Loading;