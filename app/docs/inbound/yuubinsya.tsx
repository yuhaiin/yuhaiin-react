
import { FC } from "react";
import { SettingCheck } from "../common/switch";
import { SettingInputText } from '../config/components';
import { yuubinsya } from '../pbes/config/listener/listener_pb';

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
