import { CSSProperties, FC } from 'react';
import { Spinner } from './spinner';

function Loading(props: { children?: string, code?: number, style?: CSSProperties }) {
    return (
        <div
            className="ui-loading-state z-[1090] flex flex-col justify-center items-center"
            style={{ height: "100%", ...props.style }}
        >
            {props.children !== undefined ? (
                <Error statusCode={props.code !== undefined ? props.code : 500} title={props.children} />
            ) : (
                <>
                    <div className="ui-loading-mark p-3"><Spinner /></div>
                    <span className="mt-2 text-sm text-ui-muted">Loading…</span>
                </>
            )}
        </div >
    )
}

export const Error: FC<{ statusCode?: number, title?: string, raw?: string }> = ({ statusCode, title, raw }) => {
    return <div className="ui-error-state rounded-ui-lg border border-ui-danger/20 bg-ui-danger-soft px-5 py-6 text-center">
        <p className='text-2xl font-bold text-ui-heading'>{statusCode} <span className="text-ui-danger/50">·</span> <span className='text-base font-medium'>{title}</span></p>
        {raw && <pre className="my-2 overflow-auto text-left text-sm text-ui-danger">{raw}</pre>}
    </div>
}

export default Loading;
