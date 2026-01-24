import { SettingInputVertical } from '@/component/v2/forms';
import { InputList } from '@/component/v2/listeditor';
import { FC, useState } from 'react';
import { reality } from '../pbes/config/inbound_pb';

export const Reality: FC<{ reality: reality, onChange: (x: reality) => void }> = ({ reality, onChange }) => {
    const [newShortID, setNewShortID] = useState({ value: "" });

    return (
        <>
            <SettingInputVertical readOnly label='Protocol' value={"Reality"} onChange={() => { }} />

            <SettingInputVertical label='Dest' value={reality.dest} onChange={(e: string) => onChange({ ...reality, dest: e })} />
            <SettingInputVertical label='Private Key' value={reality.privateKey} onChange={(e: string) => onChange({ ...reality, privateKey: e })} />

            <InputList
                title='Short ID'
                className='mb-3'
                data={reality.shortId}
                onChange={(e) => onChange({ ...reality, shortId: e })}
                placeholder="Enter new Short ID"
            />

            <InputList
                title='Server Name'
                className='mb-3'
                data={reality.serverName}
                onChange={(e) => onChange({ ...reality, serverName: e })}
                placeholder="Enter new Server Name"
            />
        </>
    )
}
