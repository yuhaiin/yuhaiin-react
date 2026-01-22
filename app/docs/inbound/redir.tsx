import { FC } from 'react';
import { SettingInputText } from '../../component/components';
import { redir } from '../pbes/config/inbound_pb';

export const Redir: FC<{ redir: redir, onChange: (x: redir) => void }> = ({ redir, onChange }) => {
    return (
        <>
            <SettingInputText label='Host' value={redir.host} onChange={(e: string) => onChange({ ...redir, host: e })} />
        </>
    )
}

