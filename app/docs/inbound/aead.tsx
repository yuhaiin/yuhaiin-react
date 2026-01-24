import { SettingEnumSelectVertical, SettingInputVertical } from "@/app/component/v2/forms"
import { FC } from "react"
import { aead } from "../pbes/config/inbound_pb"
import { AeadCryptoMethodSchema } from "../pbes/node/protocol_pb"

export const Aead: FC<{ aead: aead, onChange: (x: aead) => void }> = ({ aead, onChange }) => {
    return <>
        <SettingInputVertical
            label="Password"
            value={aead.password}
            onChange={(e: string) => { onChange({ ...aead, password: e }) }}
        />
        <SettingEnumSelectVertical
            type={AeadCryptoMethodSchema}
            value={aead.cryptoMethod}
            onChange={(e) => { onChange({ ...aead, cryptoMethod: e }) }}
            label="Crypto Method"
        />
    </>
}