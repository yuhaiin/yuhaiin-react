
import { SettingCheck, SettingInputVertical } from "@/app/component/v2/forms";
import { FC } from "react";
import { yuubinsya } from '../pbes/config/inbound_pb';

export const Yuubinsya: FC<{ yuubinsya: yuubinsya, onChange: (x: yuubinsya) => void }> = ({ yuubinsya, onChange }) => {
    return <>
        <SettingCheck
            label="UDP Coalesce"
            checked={yuubinsya.udpCoalesce}
            onChange={() => { onChange({ ...yuubinsya, udpCoalesce: !yuubinsya.udpCoalesce }) }}
        />
        <SettingInputVertical
            label="Password"
            value={yuubinsya.password}
            onChange={(e: string) => { onChange({ ...yuubinsya, password: e }) }}
        />
    </>
}
