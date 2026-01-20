import { CSSProperties, FC } from 'react';
import { Spinner } from "react-bootstrap";

function Loading(props: { children?: string, code?: number, style?: CSSProperties }) {
    return (
        <div
            className="z-1090 d-flex flex-column justify-content-center align-items-center"
            style={{ height: "100px", ...props.style }}
        >
            {props.children !== undefined && <><Error statusCode={props.code !== undefined ? props.code : 500} title={props.children}></Error></>}
            <div className="p2"><Spinner /></div>
        </div >
    )
}



export const Error: FC<{ statusCode?: number, title?: string, raw?: string }> = ({ statusCode, title, raw }) => {
    return <>
        <p className='fw-bold fs-3 text-center'>{statusCode} | <a className='text-reset text-decoration-none fs-6 fw-normal'>{title}</a></p>
        {raw && <pre className="text-center my-2 text-danger lead">{raw}</pre>}
    </>
}

export default Loading;