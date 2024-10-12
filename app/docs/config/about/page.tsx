"use client"

import { Card } from "react-bootstrap"
import { ItemList, SettingInputText } from "../components"
import useSWR from "swr"
import { ProtoESFetcher } from "../../common/proto"
import { infoSchema } from "../../pbes/config/config_pb"

function About() {
    const { data: info } = useSWR("/info", ProtoESFetcher(infoSchema), {})

    return <>
        <Card>
            <Card.Body>
                <SettingInputText plaintext mb='mb-0' label='Version' value={info?.version ?? ""} />
                <SettingInputText url={"https://github.com/yuhaiin/yuhaiin/commit/" + info?.commit} plaintext mb='mb-0' label='Commit' value={info?.commit ?? ""} />
                <SettingInputText plaintext mb='mb-0' label='Build Time' value={info?.buildTime ?? ""} />
                <SettingInputText plaintext mb='mb-0' label='Go Version' value={info?.goVersion ?? ""} />
                <SettingInputText
                    url="https://github.com/yuhaiin/yuhaiin"
                    plaintext mb='mb-0'
                    label='Github'
                    value={"yuhaiin/yuhaiin"}
                />
                <SettingInputText plaintext mb='mb-0' label='OS' value={info?.os ?? ""} />
                <SettingInputText plaintext mb='mb-0' label='Arch' value={info?.arch ?? ""} />
                <SettingInputText plaintext mb='mb-0' label='Compiler' value={info?.compiler ?? ""} />
                <SettingInputText plaintext mb='mb-0' label='Platform' value={info?.platform ?? ""} />
                <ItemList title='Build' data={info?.build} mb='mb-0' />
            </Card.Body>
        </Card>
    </>
}

export default About