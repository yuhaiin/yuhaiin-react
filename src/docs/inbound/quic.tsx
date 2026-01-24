import { SettingInputVertical } from '@/component/v2/forms'
import { create } from '@bufbuild/protobuf'
import { FC } from 'react'
import { TLSServerComponents } from '../node/tls_server'
import { quic } from '../pbes/config/inbound_pb'
import { tls_server_configSchema } from '../pbes/node/protocol_pb'

export const Quic: FC<{ quic: quic, onChange: (x: quic) => void }> = ({ quic, onChange }) => {
    return (
        <>
            <SettingInputVertical
                label='Host'
                className='mb-3'
                onChange={(e) => onChange({ ...quic, host: e })}
                value={quic.host}
            />

            <TLSServerComponents tls={create(tls_server_configSchema, quic.tls ? quic.tls : undefined)} onChange={(e) => onChange({ ...quic, tls: e })} />
        </>
    )
}
