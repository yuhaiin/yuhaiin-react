import { SettingInputVertical } from '@/component/v2/forms';
import { FC } from 'react';
import { redir } from '../schema/config/inbound';

export const Redir: FC<{ redir: redir, onChange: (x: redir) => void }> = ({ redir, onChange }) => {
    return (
        <>
            <SettingInputVertical label='Host' value={redir.host} onChange={(e: string) => onChange({ ...redir, host: e })} />
        </>
    )
}
