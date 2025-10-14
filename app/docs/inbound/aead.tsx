import { FC } from "react"
import { SettingTypeSelect } from "../common/switch"
import { SettingInputText } from "../config/components"
import { aead } from "../pbes/config/listener/listener_pb"
import { AeadCryptoMethodSchema } from "../pbes/node/protocol/protocol_pb"

export const Aead: FC<{ aead: aead, onChange: (x: aead) => void }> = ({ aead, onChange }) => {
    return <>
        <SettingInputText
            label="Password"
            value={aead.password}
            onChange={(e: string) => { onChange({ ...aead, password: e }) }}
        />
        <SettingTypeSelect
            type={AeadCryptoMethodSchema}
            value={aead.cryptoMethod}
            onChange={(e) => { onChange({ ...aead, cryptoMethod: e }) }}
            label="Crypto Method"
        />
    </>
}