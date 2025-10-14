import { FC } from 'react';
import { SettingInputText } from '../config/components';
import { redir } from '../pbes/config/listener/listener_pb';

export const Redir: FC<{ redir: redir, onChange: (x: redir) => void }> = ({ redir, onChange }) => {
    return (
        <>
            <SettingInputText label='Host' value={redir.host} onChange={(e: string) => onChange({ ...redir, host: e })} />
        </>
    )
}

