import { create } from '@bufbuild/protobuf';
import { FC } from 'react';
import { SettingInputText } from '../config/components';
import { TLSServerComponents } from '../node/tls_server';
import { quic } from '../pbes/config/listener/listener_pb';
import { tls_server_configSchema } from '../pbes/node/protocol/protocol_pb';

export const Quic: FC<{ quic: quic, onChange: (x: quic) => void }> = ({ quic, onChange }) => {
    return (
        <>
            <SettingInputText
                label='Host'
                onChange={(e: string) => onChange({ ...quic, host: e })}
                value={quic.host}
            />

            <TLSServerComponents tls={create(tls_server_configSchema, quic.tls ? quic.tls : undefined)} onChange={(e) => onChange({ ...quic, tls: e })} />
        </>
    )
}

