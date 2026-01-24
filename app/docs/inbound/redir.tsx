import { SettingInputVertical } from '@/app/component/v2/forms';
import { FC } from 'react';
import { redir } from '../pbes/config/inbound_pb';

export const Redir: FC<{ redir: redir, onChange: (x: redir) => void }> = ({ redir, onChange }) => {
    return (
        <>
            <SettingInputVertical label='Host' value={redir.host} onChange={(e: string) => onChange({ ...redir, host: e })} />
        </>
    )
}
