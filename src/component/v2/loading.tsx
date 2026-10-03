import { CSSProperties, FC } from 'react';
import { Spinner } from './spinner';
import { Button } from './button';
import { useTranslation } from 'react-i18next';

function Loading(props: { children?: string, code?: number, style?: CSSProperties, onRetry?: () => void }) {
    const { t } = useTranslation('common');
    const failed = props.children !== undefined || props.code !== undefined;
    return (
        <div
            className="z-[1090] flex flex-col justify-center items-center"
            style={{ height: "100%", ...props.style }}
        >
            {failed && <><Error statusCode={props.code !== undefined ? props.code : 500} title={props.children}></Error></>}
            {!failed ? <div className="p-2" role="status" aria-label={t('state.loading')}><Spinner /></div>
                : props.onRetry && <Button className="mt-3" onClick={props.onRetry}>{t('action.retry', { defaultValue: 'Retry' })}</Button>}
        </div >
    )
}

export const Error: FC<{ statusCode?: number, title?: string, raw?: string }> = ({ statusCode, title, raw }) => {
    return <div role="alert" className="max-w-full px-3 text-center break-words">
        <p className='text-2xl font-bold'>{statusCode} | <span className='text-base font-normal'>{title}</span></p>
        {raw && <pre className="my-2 max-w-full whitespace-pre-wrap text-sm text-ui-danger">{raw}</pre>}
    </div>
}

export default Loading;
