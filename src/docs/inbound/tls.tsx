import { Button } from '@/component/v2/button'
import { SettingLabel } from '@/component/v2/card'
import { SettingCheck, SettingInputVertical } from "@/component/v2/forms"
import { Textarea } from '@/component/v2/input'
import { InputList } from '@/component/v2/listeditor'
import { create } from '@bufbuild/protobuf'
import { FC, useId } from 'react'
import { TLSServerComponents } from '../node/tls_server'
import { ech_config, ech_configSchema, tls, tls_auto } from '../pbes/config/inbound_pb'
import { tls_server_configSchema } from '../pbes/node/protocol_pb'

// Inline Helper
const SettingTextareaVertical: FC<{ label: string, value: string, readonly?: boolean, onChange?: (v: string) => void }> = ({ label, value, readonly, onChange }) => {
    const id = useId();
    return (
        <div className="mb-2">
            <SettingLabel htmlFor={id} style={{ marginBottom: '0.5rem', display: 'block' }}>{label}</SettingLabel>
            <Textarea
                id={id}
                value={value}
                readOnly={readonly}
                onChange={(e) => onChange?.(e.target.value)}
                rows={4}
                className="font-monospace small"
            />
        </div>
    )
}

export const TLSAuto: FC<{ tls: tls_auto, onChange: (x: tls_auto) => void }> = ({ tls, onChange }) => {
    const setEch = (onEchChange: (x: ech_config) => ech_config) => {
        const tlsConfig = { ...tls }
        if (!tls.ech) tlsConfig.ech = create(ech_configSchema, {})
        else tlsConfig.ech = { ...tls.ech }
        onEchChange(tlsConfig.ech)
        onChange({ ...tlsConfig })
    }

    return <>
        <InputList
            title='Next Protos'
            className='mb-3'
            data={tls?.nextProtos ?? []}
            onChange={(e) => onChange({ ...tls, nextProtos: e })}
        />

        <InputList
            title='Servenames'
            className='mb-3'
            data={tls?.servernames ?? []}
            onChange={(e) => onChange({ ...tls, servernames: e })}
        />

        <SettingCheck label='ECH Enabled' checked={tls.ech ? tls.ech.enable : false} onChange={((x) => setEch((e) => { e.enable = x; return e }))} />
        {
            tls.ech?.enable &&
            <SettingInputVertical label='ECH Outer SNI' value={tls.ech ? tls.ech.OuterSNI : ""} onChange={(e: string) => setEch((x) => { x.OuterSNI = e; return x })} />
        }

        <SettingTextareaVertical label='CA Cert' value={new TextDecoder().decode(tls.caCert)} readonly />
        <SettingTextareaVertical label='CA Key' value={new TextDecoder().decode(tls.caKey)} readonly />
        <SettingInputVertical label='ECH Config' value={tls.ech ? btoa(String.fromCharCode(...(tls.ech?.config ?? []))) : ""} readOnly onChange={() => { }} />
        <SettingInputVertical label='ECH Key' value={tls.ech ? btoa(String.fromCharCode(...(tls.ech?.privateKey ?? []))) : ""} readOnly onChange={() => { }} />

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
            <SettingInputVertical readOnly label='Protocol' value={"TLS"} className="mb-3" onChange={() => { }} />
            {
                tls.tls && <TLSServerComponents tls={create(tls_server_configSchema, tls.tls)} onChange={(e) => onChange({ ...tls, tls: e })} />
            }
        </>
    )
}
