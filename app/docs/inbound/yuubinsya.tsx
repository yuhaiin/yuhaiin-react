
import { FC } from "react";
import { SettingInputText } from '../../component/components';
import { SettingCheck } from "../../component/switch";
import { yuubinsya } from '../pbes/config/inbound_pb';

export const Yuubinsya: FC<{ yuubinsya: yuubinsya, onChange: (x: yuubinsya) => void }> = ({ yuubinsya, onChange }) => {
    return <>
        <SettingCheck
            label="UDP Coalesce"
            checked={yuubinsya.udpCoalesce}
            onChange={() => { onChange({ ...yuubinsya, udpCoalesce: !yuubinsya.udpCoalesce }) }}
        />
        <SettingInputText
            label="Password"
            value={yuubinsya.password}
            onChange={(e: string) => { onChange({ ...yuubinsya, password: e }) }}
        />
    </>
}
