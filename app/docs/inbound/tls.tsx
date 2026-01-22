
import { create } from '@bufbuild/protobuf';
import { FC } from 'react';
import { Button } from 'react-bootstrap';
import { NewItemList, SettingInputText, SettingInputTextarea } from '../../component/components';
import { SettingCheck } from "../../component/switch";
import { TLSServerComponents } from '../node/tls_server';
import { ech_config, ech_configSchema, tls, tls_auto } from '../pbes/config/inbound_pb';
import { tls_server_configSchema } from '../pbes/node/protocol_pb';

export const TLSAuto: FC<{ tls: tls_auto, onChange: (x: tls_auto) => void }> = ({ tls, onChange }) => {
    const setEch = (onEchChange: (x: ech_config) => ech_config) => {
        const tlsConfig = { ...tls }
        if (!tls.ech) tlsConfig.ech = create(ech_configSchema, {})
        else tlsConfig.ech = { ...tls.ech }
        onEchChange(tlsConfig.ech)
        onChange({ ...tlsConfig })
    }

    return <>
        <NewItemList
            title='Next Protos'
            className='mb-2'
            data={tls?.nextProtos ?? []}
            onChange={(e) => onChange({ ...tls, nextProtos: e })}
        />

        <NewItemList
            title='Servenames'
            className='mb-2'
            data={tls?.servernames ?? []}
            onChange={(e) => onChange({ ...tls, servernames: e })}
        />

        <SettingCheck label='ECH Enabled' checked={tls.ech ? tls.ech.enable : false} onChange={((x) => setEch((e) => { e.enable = x; return e }))} />
        {
            tls.ech?.enable &&
            <SettingInputText label='ECH Outer SNI' value={tls.ech ? tls.ech.OuterSNI : ""} onChange={(e: string) => setEch((x) => { x.OuterSNI = e; return x })} />
        }

        <SettingInputTextarea label='CA Cert' value={new TextDecoder().decode(tls.caCert)} readonly />
        <SettingInputTextarea label='CA Key' value={new TextDecoder().decode(tls.caKey)} readonly password />
        <SettingInputText label='ECH Config' value={tls.ech ? btoa(String.fromCharCode(...tls.ech?.config)) : ""} readonly />
        <SettingInputText label='ECH Key' value={tls.ech ? btoa(String.fromCharCode(...tls.ech?.privateKey)) : ""} readonly password />

        <Button variant='outline-danger' onClick={() => onChange({
            ...tls,
            caCert: new TextEncoder().encode(""),
            caKey: new TextEncoder().encode(""),
            ech: { ...tls.ech, config: new Uint8Array(0), privateKey: new Uint8Array(0) }
        })}>regenerate</Button>
    </>
}

export const Tls: FC<{ tls: tls, onChange: (x: tls) => void }> = ({ tls, onChange }) => {
    return (
        <>
            <SettingInputText plaintext={true} label='Protocol' value={"TLS"} />
            {
                tls.tls && <TLSServerComponents tls={create(tls_server_configSchema, tls.tls)} onChange={(e) => onChange({ ...tls, tls: e })} />
            }
        </>
    )
}
