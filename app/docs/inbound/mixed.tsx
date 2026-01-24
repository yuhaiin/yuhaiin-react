import { SettingInputVertical } from '@/app/component/v2/forms';
import { FC } from 'react';
import { mixed, socks5 } from '../pbes/config/inbound_pb';

export const Socks5: FC<{ socks5: socks5, onChange: (x: socks5) => void }> = ({ socks5, onChange }) => {
    return (
        <>
            <SettingInputVertical label='Username' value={socks5.username} onChange={(e: string) => onChange({ ...socks5, username: e })} />
            <SettingInputVertical label='Password' value={socks5.password} onChange={(e: string) => onChange({ ...socks5, password: e })} />
        </>
    )
}


export const Mixed: FC<{ mixed: mixed, onChange: (x: mixed) => void }> = ({ mixed, onChange }) => {
    return (
        <>
            <SettingInputVertical label='Username' value={mixed.username} onChange={(e: string) => onChange({ ...mixed, username: e })} />
            <SettingInputVertical label='Password' value={mixed.password} onChange={(e: string) => onChange({ ...mixed, password: e })} />
        </>
    )
}
