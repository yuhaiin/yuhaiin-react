import { CSSProperties, FC } from 'react';
import { Spinner } from './spinner';

function Loading(props: { children?: string, code?: number, style?: CSSProperties }) {
    return (
        <div
            className="z-[1090] flex flex-col justify-center items-center"
            style={{ height: "100%", ...props.style }}
        >
            {props.children !== undefined && <><Error statusCode={props.code !== undefined ? props.code : 500} title={props.children}></Error></>}
            <div className="p-2"><Spinner /></div>
        </div >
    )
}

export const Error: FC<{ statusCode?: number, title?: string, raw?: string }> = ({ statusCode, title, raw }) => {
    return <>
        <p className='text-2xl font-bold text-center'>{statusCode} | <a className='text-base font-normal no-underline text-inherit cursor-pointer'>{title}</a></p>
        {raw && <pre className="my-2 text-xl text-center text-red-500">{raw}</pre>}
    </>
}

export default Loading;
